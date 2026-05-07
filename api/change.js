export function listenTableChanges(supabase, tableName, onChange) {
  const channel = supabase
    .channel(`${tableName}-changes`)
    .on(
      "postgres_changes",
      {
        event: "*", // INSERT, UPDATE, DELETE ou *
        schema: "public",
        table: tableName,
      },
      (payload) => {
        onChange(payload);
      },
    )
    .subscribe();

  return channel;
}
