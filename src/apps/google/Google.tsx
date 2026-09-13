export default function Google({ windowId }: { windowId: string }) {
  return (
    <div className="w-full h-full flex flex-col bg-white">
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 border-b border-gray-300">
        <div className="flex-1 bg-white px-3 py-1 rounded-full text-sm text-gray-700 border border-gray-300 flex items-center shadow-sm">
          <span className="text-gray-400 mr-2">🔒</span>
          https://www.google.com
        </div>
      </div>
      <iframe
        src="https://www.google.com/search?igu=1"
        className="w-full flex-1 border-none"
        title="Google"
      />
    </div>
  )
}
