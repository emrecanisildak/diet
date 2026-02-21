export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
        <p className="text-sm text-gray-400 font-medium">Yukleniyor...</p>
      </div>
    </div>
  );
}
