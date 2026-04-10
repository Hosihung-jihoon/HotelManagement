const ROOM_CLEAN_STATUS_KEY = 'roomCleanStatus';

export function readRoomCleanStatus() {
  try {
    return JSON.parse(localStorage.getItem(ROOM_CLEAN_STATUS_KEY) || '{}');
  } catch {
    return {};
  }
}

export function writeRoomCleanStatus(statusMap) {
  localStorage.setItem(ROOM_CLEAN_STATUS_KEY, JSON.stringify(statusMap));
}

export function getRoomCleanStatus(roomId) {
  const statusMap = readRoomCleanStatus();
  return statusMap[roomId] || 'clean';
}

export function setRoomCleanStatus(roomId, status) {
  const statusMap = readRoomCleanStatus();
  const next = { ...statusMap, [roomId]: status };
  writeRoomCleanStatus(next);
  return next;
}
