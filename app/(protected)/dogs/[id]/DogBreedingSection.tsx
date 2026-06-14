<form action={addHeatCycleAction} className="grid gap-3">
  <input type="hidden" name="dog_id" value={dogId} />

  <input
    name="start_date"
    type="date"
    className="bg-zinc-800 p-2 rounded"
    required
  />

  <input
    name="progesterone"
    type="number"
    step="0.1"
    className="bg-zinc-800 p-2 rounded"
    required
  />

  <textarea
    name="notes"
    className="bg-zinc-800 p-2 rounded"
  />

  <button
    type="submit"
    className="bg-amber-500 hover:bg-amber-600 text-black font-bold p-2 rounded"
  >
    Save Heat
  </button>
</form>
