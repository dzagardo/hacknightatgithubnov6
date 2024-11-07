// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const weaviate = require('weaviate-client').default;
const fetch = require('node-fetch');
global.fetch = fetch;
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadURL('http://localhost:3000');

  // Open the DevTools
  win.webContents.openDevTools();

  win.webContents.on('did-finish-load', () => {
    console.log('Window loaded successfully');
  });
}

app.whenReady().then(createWindow);

// Handle IPC messages from renderer process
ipcMain.handle('search-weaviate', async (event, query) => {
  console.log('Received search query:', query);

  // Initialize Weaviate client correctly
  const client = await weaviate.connectToWeaviateCloud(
    process.env.WEAVIATE_URL, // Ensure 'https://' is included
    {
      authCredentials: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY),
    }
  );

  console.log('Weaviate client initialized:', client);

  try {
    // Access the collection
    const collection = client.collections.get('Chunk');

    console.log('Collection:', collection);
    console.log('Available methods on collection:', Object.keys(collection));
    console.log(
      'Available methods on collection.generate.check:',
      Object.keys(collection.generate.check)
    );

    // Perform the search using collection.generate.check.nearSearch()
    const searchResult = await collection.generate.check.nearSearch({
      concepts: [query],
      distance: 0.7,
      limit: 10,
    });

    console.log('Weaviate search result:', searchResult);

    // **Include the properties to fetch**
    searchResult.search.withFetch(['text', 'title', 'otherProperty']); // Replace with your actual property names

    // Execute the search by calling 'call()' on the 'search' object
    const response = await searchResult.search.call();

    console.log('Weaviate search response:', response);

    // Extract the results from the response
    const chunks = response.results;

    console.log('Extracted chunks:', JSON.stringify(chunks, null, 2));

    // Return the chunks to the renderer process
    return chunks;
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  } finally {
    // Close the client connection
    client.close();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
