
-- Small stats library                      --
----------------------------------------------
-- Version History --
-- 1.0 First written.

-- Tables supplied as arguments are not changed.
-- Credit: http://lua-users.org/wiki/SimpleStats

-- Table to hold statistical functions
stats={}

-- Get the mean value of a table
function stats.mean( t )
  local sum = 0
  local count= 0

  for k,v in pairs(t) do
    if type(v) == 'number' then
      sum = sum + v
      count = count + 1
    end
  end

  return (sum / count)
end

-- Get the median of a table.
function stats.median( t )
  local temp={}

  -- deep copy table so that when we sort it, the original is unchanged
  -- also weed out any non numbers
  for k,v in pairs(t) do
    if type(v) == 'number' then
      table.insert( temp, v )
    end
  end

  table.sort( temp )

  -- If we have an even number of table elements or odd.
  if math.fmod(#temp,2) == 0 then
    -- return mean value of middle two elements
    return ( temp[#temp/2] + temp[(#temp/2)+1] ) / 2
  else
    -- return middle element
    return temp[math.ceil(#temp/2)]
  end
end


-- Get the standard deviation of a table
function stats.standardDeviation( t )
  local m
  local vm
  local sum = 0
  local count = 0
  local result

  m = stats.mean( t )

  for k,v in pairs(t) do
    if type(v) == 'number' then
      vm = v - m
      sum = sum + (vm * vm)
      count = count + 1
    end
  end

  result = math.sqrt(sum / (count-1))

  return result
end

-- Get the max and min for a table
function stats.maxmin( t )
  local max = -math.huge
  local min = math.huge

  for k,v in pairs( t ) do
    if type(v) == 'number' then
      max = math.max( max, v )
      min = math.min( min, v )
    end
  end

  return max, min
end
-- End: Small stats library                      --

function copy(obj)
  if type(obj) ~= 'table' then return obj end
  local res = {}
  for k, v in pairs(obj) do res[copy(k)] = copy(v) end
  return res
end

function modify_cpu_stats(tag, timestamp, record)
  new_record = record
  core = 0
  core_cpu = {}
  core_min = nil
  core_max = nil
  core_average = nil
  core_stddev = nil
  core_json = "["
  while(not(isempty(new_record[string.format("cpu%d.p_cpu", core)])) and not(isempty(new_record[string.format("cpu%d.p_user", core)])) and not(isempty(new_record[string.format("cpu%d.p_system", core)])) )
  do
      core_cpu[core] = new_record[string.format("cpu%d.p_cpu", core)]

      core_json = core_json .. string.format('{"user":%f,"system":%f},',
          new_record[string.format("cpu%d.p_user", core)],
          new_record[string.format("cpu%d.p_system", core)])

      new_record[string.format("cpu%d.p_cpu", core)] = nil
      new_record[string.format("cpu%d.p_user", core)] = nil
      new_record[string.format("cpu%d.p_system", core)] = nil
      core = core + 1
  end
  if core > 0 then
      core_json = core_json:sub(1, -2) .. "]"
      new_record["host.cpu.cores"] = core
      new_record["host.cpu.core_json"] = core_json
      new_record["host.cpu.usage_core_median"] = stats.median(core_cpu)
      new_record["host.cpu.usage_core_max"], new_record["host.cpu.usage_core_min"] = stats.maxmin(core_cpu)
      new_record["host.cpu.usage_core_stddev"] = stats.standardDeviation(core_cpu)
  end
  return 2, timestamp, new_record
end
