const { Server } = require('socket.io');

let io = null;

// In-memory active professional location store (prevents DB hammering every 2 seconds)
const activeLocations = new Map();

function initSocket(httpServer, clientUrl) {
  io = new Server(httpServer, {
    cors: {
      origin: '*', // Permissive for local testing and dev
      methods: ['GET', 'POST', 'PATCH'],
      credentials: true,
    },
    pingTimeout: 60000,
  });

  io.on('connection', (socket) => {
    // 1. Join a booking specific room
    socket.on('join:booking', ({ bookingId, userId, role }) => {
      if (bookingId) {
        socket.join(`booking_${bookingId}`);
        console.log(`[Socket] Socket ${socket.id} (${role || 'user'}) joined room booking_${bookingId}`);

        // If there is an active cached location for this booking, send it immediately to newly joined client
        if (activeLocations.has(bookingId)) {
          socket.emit('professional:location-updated', activeLocations.get(bookingId));
        }
      }
    });

    // 2. Leave booking room
    socket.on('leave:booking', ({ bookingId }) => {
      if (bookingId) {
        socket.leave(`booking_${bookingId}`);
      }
    });

    // 3. Professional real-time GPS location stream
    socket.on('professional:location', ({ bookingId, latitude, longitude, accuracy, heading, speed, etaMinutes, distanceKm }) => {
      if (!bookingId || latitude === undefined || longitude === undefined) return;

      const locationPayload = {
        bookingId,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        accuracy: accuracy ? parseFloat(accuracy) : null,
        heading: heading || null,
        speed: speed || null,
        etaMinutes: etaMinutes !== undefined ? etaMinutes : null,
        distanceKm: distanceKm !== undefined ? distanceKm : null,
        timestamp: new Date().toISOString(),
        status: 'live',
      };

      // Cache in memory
      activeLocations.set(bookingId, locationPayload);

      // Broadcast to all clients in this booking room (customer & admin)
      socket.to(`booking_${bookingId}`).emit('professional:location-updated', locationPayload);
    });

    // 4. Disconnect
    socket.on('disconnect', () => {
      // socket disconnected
    });
  });

  return io;
}

function getIO() {
  return io;
}

function emitToBooking(bookingId, event, data) {
  if (io && bookingId) {
    io.to(`booking_${bookingId}`).emit(event, data);
    console.log(`[Socket Broadcast] booking_${bookingId} -> ${event}`);
  }
}

function getActiveLocation(bookingId) {
  return activeLocations.get(bookingId) || null;
}

module.exports = {
  initSocket,
  getIO,
  emitToBooking,
  getActiveLocation,
};
