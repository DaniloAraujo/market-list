/** Título editável da lista. */
export default function ListHeader({ name, onRename, onCommit }) {
  return (
    <input
      value={name}
      onChange={(e) => onRename(e.target.value)}
      onBlur={onCommit}
      onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
      maxLength={80}
      placeholder="Nome da lista"
      aria-label="Nome da lista"
      className="-mx-2 w-[calc(100%+1rem)] truncate rounded-lg bg-transparent px-2 py-1 font-display text-2xl font-semibold tracking-tight outline-none transition-colors placeholder:text-muted-foreground/60 hover:bg-muted/60 focus-visible:bg-muted/60 sm:text-3xl"
    />
  );
}
