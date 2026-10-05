const { Server } = require('socket.io');

let io = null;

// In-memory active professional location store (prevents DB hammering every 2 seconds)
const activeLocations = new Map();

function initSocket(httpServer, clientUrl) {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => callback(null, true),
      methods: ['GET', 'POST', 'PATCH'],
      credentials: true,
    },
    pingTimeout: 60000,
  });

  io.on('connection', (socket) => {
    // 1. Join a booking specific room (supports both booking_${id} and booking:${id})
    socket.on('join:booking', ({ bookingId, userId, role }) => {
      if (bookingId) {
        socket.join(`booking_${bookingId}`);
        socket.join(`booking:${bookingId}`);
        console.log(`[Socket] Socket ${socket.id} (${role || 'user'}) joined room booking:${bookingId}`);

        // If there is an active cached location for this booking, send it immediately
        if (activeLocations.has(bookingId)) {
          const loc = activeLocations.get(bookingId);
          socket.emit('professional:location', loc);
          socket.emit('professional:location-updated', loc);
        }
      }
    });

    // 2. Leave booking room
    socket.on('leave:booking', ({ bookingId }) => {
      if (bookingId) {
        socket.leave(`booking_${bookingId}`);
        socket.leave(`booking:${bookingId}`);
      }
    });

    // 3. Professional real-time GPS location stream
    const handleLocationUpdate = ({ bookingId, professionalId, latitude, longitude, accuracy, heading, speed, etaMinutes, distanceKm, routeCoordinates }) => {
      if (!bookingId || latitude === undefined || longitude === undefined) return;

      const locationPayload = {
        bookingId,
        professionalId: professionalId || null,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        accuracy: accuracy ? parseFloat(accuracy) : null,
        heading: heading || null,
        speed: speed || null,
        etaMinutes: etaMinutes !== undefined ? etaMinutes : null,
        distanceKm: distanceKm !== undefined ? distanceKm : null,
        routeCoordinates: routeCoordinates || [],
        timestamp: new Date().toISOString(),
        status: 'live',
      };

      // Cache in memory for quick retrieval
      activeLocations.set(bookingId, locationPayload);

      // Broadcast to both room formats (customer, pro, admin)
      socket.to(`booking_${bookingId}`).emit('professional:location', locationPayload);
      socket.to(`booking_${bookingId}`).emit('professional:location-updated', locationPayload);
      socket.to(`booking:${bookingId}`).emit('professional:location', locationPayload);
      socket.to(`booking:${bookingId}`).emit('professional:location-updated', locationPayload);
    };

    socket.on('professional:location', handleLocationUpdate);
    socket.on('professional:location:update', handleLocationUpdate);

    // 4. Booking status updates via Socket
    socket.on('booking:status:change', ({ bookingId, status, professionalId }) => {
      if (bookingId && status) {
        const payload = { bookingId, status, professionalId, timestamp: new Date().toISOString() };
        io.to(`booking_${bookingId}`).emit('booking:status', payload);
        io.to(`booking:${bookingId}`).emit('booking:status', payload);
      }
    });

    // 5. Disconnect
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
    io.to(`booking:${bookingId}`).emit(event, data);
    console.log(`[Socket Broadcast] booking:${bookingId} -> ${event}`);
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
