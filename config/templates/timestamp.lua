
function append_event_created(tag, timestamp, record)
    new_record = record
    new_record["event.created"] = (os.date("!%Y-%m-%dT%H:%M:%S", timestamp["sec"]) .. '.' .. math.floor(timestamp["nsec"] / 1000000) .. 'Z')
    return 2, timestamp, new_record
end

function append_timestamp(tag, timestamp, record)
  new_record = record
  new_record["@timestamp"] = (os.date("!%Y-%m-%dT%H:%M:%S", timestamp["sec"]) .. '.' .. math.floor(timestamp["nsec"] / 1000000) .. 'Z')
  return 2, timestamp, new_record
end
