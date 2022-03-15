function copy(obj)
  if type(obj) ~= 'table' then return obj end
  local res = {}
  for k, v in pairs(obj) do res[copy(k)] = copy(v) end
  return res
end

function multiplex_disk_stats(tag, timestamp, record)
  new_record = {}

  for k, v in pairs(record["disk"]) do
      new_record[k] = copy(record)
      new_record[k]["host.disk.mount"] = v["mount"]
      new_record[k]["host.disk.total"] = tonumber(v["total"])
      new_record[k]["host.disk.free"] = tonumber(v["available"])
      new_record[k]["host.disk.used"] = tonumber(v["total"]) - tonumber(v["available"])
      new_record[k]["host.disk.used_percentage"] = new_record[k]["host.disk.used"] / tonumber(v["total"])

      new_record[k]["disk"] = nil
  end

  return 2, timestamp, new_record
end
