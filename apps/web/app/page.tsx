/**
 * NSTG Web - Negative Space Test Generator Web Interface
 *
 * Landing page for the NSTG web application.
 */

export const metadata = {
  title: 'NSTG - Negative Space Test Generator',
  description: 'Generate comprehensive tests by analyzing untested code boundaries',
};

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">NSTG - Negative Space Test Generator</h1>
        <p className="text-xl text-gray-600 mb-8">
          Generate comprehensive tests by analyzing untested code boundaries
        </p>
        <div className="bg-gray-100 rounded-lg p-8 max-w-2xl">
          <p className="text-gray-700">Welcome to NSTG. This web interface is under development.</p>
        </div>
      </div>
    </main>
  );
}
