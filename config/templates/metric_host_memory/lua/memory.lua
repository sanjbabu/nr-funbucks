
function add_system_memory_percentage(tag, timestamp, record)
  new_record = record
  if not(isempty(new_record["host.memory.used"])) and not(isempty(new_record["host.memory.total"])) then
      new_record["host.memory.used_percentage"] = record["host.memory.used"] / record["host.memory.total"]
  end
  if not(isempty(new_record["host.swap.used"])) and not(isempty(new_record["host.swap.total"])) then
      new_record["host.swap.used_percentage"] = record["host.swap.used"] / record["host.swap.total"]
  end
  return 2, timestamp, new_record
end
