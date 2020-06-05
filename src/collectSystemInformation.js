const systemInfo = require('systeminformation');

const memoryCache = {};

/**
 * Collect common information of the system
 * Attach: Uptime and OS information 
 */
const getCommonInformation = async () => {
  let commonInfo = {};
  try {
    const timeRes = await systemInfo.time();
    if (!memoryCache.osInfo) {
      const osRes = await systemInfo.osInfo();
      const { platform, distro, release, arch } = osRes;
      memoryCache.osInfo = {
        platform,
        distro,
        release,
        arch 
        };
    }
    
    const { uptime } = timeRes;
    commonInfo = { 
      upTime: uptime, 
      upTimeUnit: "s",
      os: memoryCache.osInfo
    };
  } catch (error) {
    commonInfo = { error };
  }
  return commonInfo;
};

/**
 * Collect CPU information from the system
 */
const getCpuInformation = async () => {
  let cpuInfo = {};
  try {
    if (!memoryCache.cpuInfo) {

      const cpuResponse = await systemInfo.cpu();
      const { cores, physicalCores, processors, speedmin, speedmax } = cpuResponse;
      memoryCache.cpuInfo = {
        cores,
        physicalCores,
        processors
      };
      memoryCache.cpuSpeed = {
        min: speedmin,
        max: speedmax
      };
    }
    
    const cpuSpeedResponse = await systemInfo.cpuCurrentspeed();
    const { avg, cores: coresSpeed } = cpuSpeedResponse;
    cpuInfo = {
      ...memoryCache.cpuInfo,
      speed: {
        ...memoryCache.cpuSpeed,
        avg
      },
      coresSpeed
    };
  } catch(error) {
    cpuInfo = { error };
  }
  return cpuInfo;
};

/**
 * Get Memory information from the system
 */
const getMemoryInformation = async () => {
  let memoryInfo = {};
  try {
    const memResponse = await systemInfo.mem();
    const { total, active } = memResponse;
    if (!memoryCache.totalMemory) {
      memoryCache.totalMemory = Number((total / 1024 / 1024 / 1024).toFixed(2));
    }
    memoryInfo = {
      unit: "GB",
      total: memoryCache.totalMemory,
      active: Number((active / 1024 / 1024 / 1024).toFixed(2))
    };
  } catch(error) {
    memoryInfo = { error };
  }
  return memoryInfo;
};

/**
 * Collect system information such as OS, CPU and Memory information
 * @param {*} config { common: boolean, cpu: boolean, memory: boolean }
 */
const collectSystemInformation = async (config) => {
  const response = {};
  if (config) {
    const { common, cpu, memory } = config;
    if (common) {
      response.common = await getCommonInformation();
    }
    if (cpu) {
      response.cpu = await getCpuInformation();
    }
    if (memory) {
      response.memory = await getMemoryInformation();
    }
  }
  return response;
};

module.exports = {
  collectSystemInformation
};
