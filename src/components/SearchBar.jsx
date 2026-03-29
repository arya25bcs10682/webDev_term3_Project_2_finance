export default function SearchBar({ searchQuery, onChange }) {
  return (
    <div className="search-bar">
      <label className="search-bar__label" htmlFor="transactions-search">
        Search
      </label>
      <input
        id="transactions-search"
        type="search"
        className="search-bar__input"
        placeholder="Search by title or notes…"
        value={searchQuery}
        onChange={onChange}
        autoComplete="off"
        enterKeyHint="search"
      />
    </div>
  )
}
