/**
 * Room Manager - Tracks active rooms and participants
 */
class RoomManager {
  constructor() {
    // Map of looproomId -> Set of socket IDs
    this.rooms = new Map();

    // Map of looproomId -> room statistics
    this.roomStats = new Map();

    // Map of looproomId -> broadcaster info
    this.broadcasters = new Map();
  }

  /**
   * Add a user to a room
   * @param {string} looproomId - Looproom ID
   * @param {string} socketId - Socket ID
   * @param {Object} userData - User data
   */
  joinRoom(looproomId, socketId, userData) {
    // Initialize room if it doesn't exist
    if (!this.rooms.has(looproomId)) {
      this.rooms.set(looproomId, new Map());
      this.roomStats.set(looproomId, {
        participantCount: 0,
        peakParticipants: 0,
        messageCount: 0,
        startTime: Date.now(),
      });
    }

    // Add user to room
    const room = this.rooms.get(looproomId);
    room.set(socketId, {
      userId: userData.userId,
      name: userData.name,
      joinedAt: Date.now(),
      mood: userData.mood,
    });

    // Update stats
    const stats = this.roomStats.get(looproomId);
    stats.participantCount = room.size;
    stats.peakParticipants = Math.max(stats.peakParticipants, room.size);

    return {
      participantCount: stats.participantCount,
      peakParticipants: stats.peakParticipants,
    };
  }

  /**
   * Remove a user from a room
   * @param {string} looproomId - Looproom ID
   * @param {string} socketId - Socket ID
   */
  leaveRoom(looproomId, socketId) {
    const room = this.rooms.get(looproomId);
    if (!room) return null;

    const userData = room.get(socketId);
    room.delete(socketId);

    // Update stats
    const stats = this.roomStats.get(looproomId);
    if (stats) {
      stats.participantCount = room.size;
    }

    // Clean up empty rooms
    if (room.size === 0) {
      this.rooms.delete(looproomId);
      this.roomStats.delete(looproomId);
    }

    return userData;
  }

  /**
   * Get all participants in a room
   * @param {string} looproomId - Looproom ID
   * @returns {Array} Array of participants
   */
  getRoomParticipants(looproomId) {
    const room = this.rooms.get(looproomId);
    if (!room) return [];

    return Array.from(room.values());
  }

  /**
   * Get room statistics
   * @param {string} looproomId - Looproom ID
   * @returns {Object} Room statistics
   */
  getRoomStats(looproomId) {
    return this.roomStats.get(looproomId) || null;
  }

  /**
   * Increment message count for a room
   * @param {string} looproomId - Looproom ID
   */
  incrementMessageCount(looproomId) {
    const stats = this.roomStats.get(looproomId);
    if (stats) {
      stats.messageCount++;
    }
  }

  /**
   * Check if user is in room
   * @param {string} looproomId - Looproom ID
   * @param {string} socketId - Socket ID
   * @returns {boolean}
   */
  isUserInRoom(looproomId, socketId) {
    const room = this.rooms.get(looproomId);
    return room ? room.has(socketId) : false;
  }

  /**
   * Get all active rooms
   * @returns {Array} Array of room IDs
   */
  getActiveRooms() {
    return Array.from(this.rooms.keys());
  }

  /**
   * Get participant count for a room
   * @param {string} looproomId - Looproom ID
   * @returns {number}
   */
  getParticipantCount(looproomId) {
    const room = this.rooms.get(looproomId);
    return room ? room.size : 0;
  }

  /**
   * Set broadcaster for a room
   * @param {string} looproomId - Looproom ID
   * @param {Object} broadcasterInfo - Broadcaster information
   */
  setBroadcaster(looproomId, broadcasterInfo) {
    this.broadcasters.set(looproomId, broadcasterInfo);
  }

  /**
   * Get broadcaster for a room
   * @param {string} looproomId - Looproom ID
   * @returns {Object|null} Broadcaster information
   */
  getBroadcaster(looproomId) {
    return this.broadcasters.get(looproomId) || null;
  }

  /**
   * Remove broadcaster from a room
   * @param {string} looproomId - Looproom ID
   */
  removeBroadcaster(looproomId) {
    this.broadcasters.delete(looproomId);
  }
}

// Export singleton instance
module.exports = new RoomManager();
