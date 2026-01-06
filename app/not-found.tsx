import Link from "next/link";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-lg text-gray-600 mb-8">
        Halaman tidak ditemukan
      </p>

      <Link
        href="/"
        className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
};

export default NotFound;
