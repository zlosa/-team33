const WebSocket = require('ws');
const { HumeApi, HumeStream } = require('hume');

const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', function connection(ws) {
  console.log('Client connected');
  
  // Initialize Hume client
  const hume = new HumeApi({
    apiKey: process.env.HUME_API_KEY,
    secretKey: process.env.HUME_SECRET_KEY,
  });

  ws.on('message', async function incoming(message) {
    try {
      const data = JSON.parse(message);
      
      // Accept either { data: base64 } or { type: 'frame', data: 'data:image/jpeg;base64,...' }
      const incomingBase64 = data?.data || data?.file;
      if (incomingBase64) {
        // If prefixed with data URL, strip the header
        const base64Data = incomingBase64.includes(',') ? incomingBase64.split(',')[1] : incomingBase64;
        const imageBuffer = Buffer.from(base64Data, 'base64');
        
        try {
          // Send to Hume API for expression measurement
          const result = await hume.expressionMeasurement.batch.startInferenceJob({
            models: {
              face: {}
            },
            urls: [],
            files: [{
              filename: 'frame.jpg',
              content: imageBuffer
            }]
          });
          
          // Send results back to client
          ws.send(JSON.stringify(result));
          
        } catch (apiError) {
          console.error('Hume API error:', apiError);
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Failed to process frame',
            error: apiError.message
          }));
        }
      }
    } catch (error) {
      console.error('Message processing error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Failed to process message'
      }));
    }
  });

  ws.on('close', function() {
    console.log('Client disconnected');
  });
});

module.exports = (req, res) => {
  if (req.method === 'GET') {
    if (req.headers.upgrade !== 'websocket') {
      res.status(426).send('Upgrade required');
      return;
    }
    wss.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => {
      wss.emit('connection', ws, req);
    });
  } else {
    res.status(405).end();
  }
};
