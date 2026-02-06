import * as ts from 'typescript';
import type {
  FunctionParameter,
  FunctionSignature,
  TypeConstraint,
  TypeNode,
} from '../types.js';

/**
 * Analyzes TypeScript function source code to extract signatures and metadata
 */
export class FunctionAnalyzer {
  private checker: ts.TypeChecker | null = null;

  /**
   * Analyzes a TypeScript source file and extracts function signatures
   * @param sourceCode - TypeScript source code containing functions
   * @param fileName - Optional file name for better error messages
   * @returns Array of function signatures found in the source
   */
  analyze(sourceCode: string, fileName = 'source.ts'): FunctionSignature[] {
    // Create source file from code
    const sourceFile = ts.createSourceFile(
      fileName,
      sourceCode,
      ts.ScriptTarget.Latest,
      true,
    );

    // Create program for type checking
    const compilerHost = ts.createCompilerHost({});
    compilerHost.getSourceFile = (name) => {
      if (name === fileName) return sourceFile;
      return ts.createSourceFile(name, '', ts.ScriptTarget.Latest, true);
    };

    const program = ts.createProgram([fileName], {}, compilerHost);
    this.checker = program.getTypeChecker();

    const signatures: FunctionSignature[] = [];

    // Visit all nodes to find function declarations
    const visit = (node: ts.Node) => {
      if (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node)) {
        const signature = this.extractFunctionSignature(node, sourceFile);
        if (signature) {
          signatures.push(signature);
        }
      }
      ts.forEachChild(node, visit);
    };

    visit(sourceFile);

    return signatures;
  }

  /**
   * Extracts function signature from AST node
   */
  private extractFunctionSignature(
    node: ts.FunctionDeclaration | ts.ArrowFunction,
    sourceFile: ts.SourceFile,
  ): FunctionSignature | null {
    // Get function name (arrow functions may be unnamed)
    const name =
      ts.isFunctionDeclaration(node) && node.name
        ? node.name.text
        : 'anonymous';

    // Extract parameters
    const parameters = node.parameters.map((param) =>
      this.extractParameter(param),
    );

    // Extract return type
    const returnType = this.extractReturnType(node);

    // Extract source location
    const { line: startLine } = sourceFile.getLineAndCharacterOfPosition(
      node.getStart(),
    );
    const { line: endLine } = sourceFile.getLineAndCharacterOfPosition(
      node.getEnd(),
    );

    // Parse JSDoc for additional metadata
    const jsdocMetadata = this.extractJSDocMetadata(node);

    return {
      name,
      parameters: parameters.map((param, index) => ({
        ...param,
        type: this.enrichWithJSDoc(
          param.type,
          jsdocMetadata.params[param.name],
        ),
      })),
      returnType: this.enrichWithJSDoc(
        returnType,
        jsdocMetadata.returns,
      ),
      sourceFile: sourceFile.fileName,
      startLine,
      endLine,
    };
  }

  /**
   * Extracts parameter information from AST node
   */
  private extractParameter(param: ts.ParameterDeclaration): FunctionParameter {
    const name = param.name.getText();
    const optional = param.questionToken !== undefined;
    const type = param.type ? this.parseTypeNode(param.type) : this.createAnyType();
    const defaultValue = param.initializer
      ? this.extractLiteralValue(param.initializer)
      : undefined;

    return {
      name,
      type,
      optional,
      defaultValue,
    };
  }

  /**
   * Extracts return type from function node
   */
  private extractReturnType(
    node: ts.FunctionDeclaration | ts.ArrowFunction,
  ): TypeNode {
    if (node.type) {
      return this.parseTypeNode(node.type);
    }

    // Try to infer from body if no explicit type
    if (ts.isArrowFunction(node) && !ts.isBlock(node.body)) {
      // For expression arrows, try to infer from the expression
      return this.inferTypeFromExpression(node.body);
    }

    return this.createAnyType();
  }

  /**
   * Parses TypeScript type node into our TypeNode representation
   */
  private parseTypeNode(typeNode: ts.TypeNode): TypeNode {
    switch (typeNode.kind) {
      case ts.SyntaxKind.StringKeyword:
        return { kind: 'primitive', name: 'string' };
      case ts.SyntaxKind.NumberKeyword:
        return { kind: 'primitive', name: 'number' };
      case ts.SyntaxKind.BooleanKeyword:
        return { kind: 'primitive', name: 'boolean' };
      case ts.SyntaxKind.NullKeyword:
        return { kind: 'primitive', name: 'null' };
      case ts.SyntaxKind.UndefinedKeyword:
        return { kind: 'primitive', name: 'undefined' };
      case ts.SyntaxKind.VoidKeyword:
        return { kind: 'primitive', name: 'void' };
      case ts.SyntaxKind.AnyKeyword:
        return { kind: 'any' };
      case ts.SyntaxKind.UnknownKeyword:
        return { kind: 'unknown' };
      case ts.SyntaxKind.NeverKeyword:
        return { kind: 'never' };

      case ts.SyntaxKind.LiteralType:
        return this.parseLiteralType(typeNode as ts.LiteralTypeNode);

      case ts.SyntaxKind.UnionType:
        return this.parseUnionType(typeNode as ts.UnionTypeNode);

      case ts.SyntaxKind.IntersectionType:
        return this.parseIntersectionType(typeNode as ts.IntersectionTypeNode);

      case ts.SyntaxKind.ArrayType:
        return this.parseArrayType(typeNode as ts.ArrayTypeNode);

      case ts.SyntaxKind.TupleType:
        return this.parseTupleType(typeNode as ts.TupleTypeNode);

      case ts.SyntaxKind.TypeReference:
        return this.parseTypeReference(typeNode as ts.TypeReferenceNode);

      default:
        return { kind: 'unknown' };
    }
  }

  /**
   * Parses literal type (e.g., 'hello', 42, true)
   */
  private parseLiteralType(node: ts.LiteralTypeNode): TypeNode {
    const literal = node.literal;
    if (ts.isStringLiteral(literal)) {
      return { kind: 'literal', name: `"${literal.text}"` };
    }
    if (ts.isNumericLiteral(literal)) {
      return { kind: 'literal', name: literal.text };
    }
    if (literal.kind === ts.SyntaxKind.TrueKeyword) {
      return { kind: 'literal', name: 'true' };
    }
    if (literal.kind === ts.SyntaxKind.FalseKeyword) {
      return { kind: 'literal', name: 'false' };
    }
    return { kind: 'unknown' };
  }

  /**
   * Parses union type (e.g., string | number)
   */
  private parseUnionType(node: ts.UnionTypeNode): TypeNode {
    return {
      kind: 'union',
      children: node.types.map((t) => this.parseTypeNode(t)),
    };
  }

  /**
   * Parses intersection type (e.g., A & B)
   */
  private parseIntersectionType(node: ts.IntersectionTypeNode): TypeNode {
    return {
      kind: 'intersection',
      children: node.types.map((t) => this.parseTypeNode(t)),
    };
  }

  /**
   * Parses array type (e.g., string[])
   */
  private parseArrayType(node: ts.ArrayTypeNode): TypeNode {
    return {
      kind: 'array',
      children: [this.parseTypeNode(node.elementType)],
    };
  }

  /**
   * Parses tuple type (e.g., [string, number])
   */
  private parseTupleType(node: ts.TupleTypeNode): TypeNode {
    return {
      kind: 'tuple',
      children: node.elements.map((e) =>
        this.parseTypeNode(e as ts.TypeNode),
      ),
    };
  }

  /**
   * Parses type reference (e.g., MyType, Array<T>)
   */
  private parseTypeReference(node: ts.TypeReferenceNode): TypeNode {
    const typeName = node.typeName.getText();

    // Handle generic types
    if (node.typeArguments && node.typeArguments.length > 0) {
      return {
        kind: 'generic',
        name: typeName,
        children: node.typeArguments.map((arg) => this.parseTypeNode(arg)),
      };
    }

    return { kind: 'primitive', name: typeName };
  }

  /**
   * Extracts JSDoc metadata from function node
   */
  private extractJSDocMetadata(
    node: ts.FunctionDeclaration | ts.ArrowFunction,
  ): JSDocMetadata {
    const metadata: JSDocMetadata = { params: {}, examples: [] };

    const jsdocTags = ts.getJSDocTags(node);

    for (const tag of jsdocTags) {
      const tagName = tag.tagName.text;
      const comment = ts.getTextOfJSDocComment(tag.comment);

      if (tagName === 'param' && ts.isJSDocParameterTag(tag)) {
        const paramName = tag.name?.getText() || '';
        metadata.params[paramName] = this.parseJSDocConstraints(
          comment || '',
        );
      } else if (tagName === 'returns' || tagName === 'return') {
        metadata.returns = this.parseJSDocConstraints(comment || '');
      } else if (tagName === 'example') {
        metadata.examples.push(comment || '');
      } else if (tagName === 'edge-case') {
        if (!metadata.edgeCases) metadata.edgeCases = [];
        metadata.edgeCases.push(comment || '');
      }
    }

    return metadata;
  }

  /**
   * Parses JSDoc constraints from comment text
   * Example: "@param age - Must be between 0 and 150"
   */
  private parseJSDocConstraints(comment: string): TypeConstraint[] {
    const constraints: TypeConstraint[] = [];

    // Parse range constraints (e.g., "between 0 and 100", "0-100", ">= 0")
    const rangePatterns = [
      /between\s+(-?\d+(?:\.\d+)?)\s+and\s+(-?\d+(?:\.\d+)?)/i,
      /(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/,
      />=?\s*(-?\d+(?:\.\d+)?)/,
      /<=?\s*(-?\d+(?:\.\d+)?)/,
    ];

    for (const pattern of rangePatterns) {
      const match = comment.match(pattern);
      if (match) {
        constraints.push({
          type: 'range',
          value: match[2] ? [Number(match[1]), Number(match[2])] : Number(match[1]),
          description: match[0],
        });
      }
    }

    // Parse length constraints (e.g., "max length 100")
    const lengthMatch = comment.match(/(?:max|min)?\s*length\s*(?:of)?\s*(\d+)/i);
    if (lengthMatch) {
      constraints.push({
        type: 'length',
        value: Number(lengthMatch[1]),
        description: lengthMatch[0],
      });
    }

    // Parse pattern constraints (e.g., "must match /^[a-z]+$/")
    const patternMatch = comment.match(/(?:match|pattern)[:\s]+\/(.+?)\//);
    if (patternMatch) {
      constraints.push({
        type: 'pattern',
        value: patternMatch[1],
        description: patternMatch[0],
      });
    }

    return constraints;
  }

  /**
   * Enriches type with JSDoc constraints
   */
  private enrichWithJSDoc(
    type: TypeNode,
    constraints?: TypeConstraint[],
  ): TypeNode {
    if (!constraints || constraints.length === 0) {
      return type;
    }

    return {
      ...type,
      constraints: [...(type.constraints || []), ...constraints],
    };
  }

  /**
   * Attempts to infer type from expression
   */
  private inferTypeFromExpression(expr: ts.Expression): TypeNode {
    if (ts.isStringLiteral(expr)) {
      return { kind: 'primitive', name: 'string' };
    }
    if (ts.isNumericLiteral(expr)) {
      return { kind: 'primitive', name: 'number' };
    }
    if (expr.kind === ts.SyntaxKind.TrueKeyword || expr.kind === ts.SyntaxKind.FalseKeyword) {
      return { kind: 'primitive', name: 'boolean' };
    }
    if (ts.isArrayLiteralExpression(expr)) {
      return { kind: 'array', children: [{ kind: 'unknown' }] };
    }
    if (ts.isObjectLiteralExpression(expr)) {
      return { kind: 'object' };
    }

    return this.createAnyType();
  }

  /**
   * Extracts literal value from initializer expression
   */
  private extractLiteralValue(expr: ts.Expression): unknown {
    if (ts.isStringLiteral(expr)) {
      return expr.text;
    }
    if (ts.isNumericLiteral(expr)) {
      return Number(expr.text);
    }
    if (expr.kind === ts.SyntaxKind.TrueKeyword) {
      return true;
    }
    if (expr.kind === ts.SyntaxKind.FalseKeyword) {
      return false;
    }
    if (expr.kind === ts.SyntaxKind.NullKeyword) {
      return null;
    }
    if (expr.kind === ts.SyntaxKind.UndefinedKeyword) {
      return undefined;
    }

    return undefined;
  }

  /**
   * Creates an 'any' type node
   */
  private createAnyType(): TypeNode {
    return { kind: 'any' };
  }
}

/**
 * JSDoc metadata extracted from function
 */
interface JSDocMetadata {
  params: Record<string, TypeConstraint[]>;
  returns?: TypeConstraint[];
  examples: string[];
  edgeCases?: string[];
}
