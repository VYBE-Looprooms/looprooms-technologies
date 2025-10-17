/**
 * Generate a random access code for private looprooms
 * Format: 6 uppercase alphanumeric characters (e.g., ABC123)
 */
function generateAccessCode() {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar looking chars
  let code = '';
  
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return code;
}

/**
 * Generate a shareable link for a looproom
 */
function generateShareableLink(looproomId, accessCode = null) {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  let link = `${baseUrl}/looproom/${looproomId}`;
  
  if (accessCode) {
    link += `?code=${accessCode}`;
  }
  
  return link;
}

module.exports = {
  generateAccessCode,
  generateShareableLink
};
