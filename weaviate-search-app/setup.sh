#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Setting up the Weaviate Search Electron App..."

# Install Electron Packager for packaging the app
npm install --save-dev electron-packager

# Create directories
mkdir -p public src src/components

# Create .babelrc
cat <<EOF > .babelrc
{
  "presets": ["@babel/preset-env", "@babel/preset-react"]
}
EOF

# Create .env (you need to update this file with your actual Weaviate URL and API key)
cat <<EOF > .env
WEAVIATE_URL=your-weaviate-instance-url
WEAVIATE_API_KEY=your-weaviate-api-key
EOF

# Create webpack.config.js
cat <<EOF > webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  entry: './src/index.js',
  target: 'electron-renderer',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\\.jsx?\$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\\.css\$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env),
    }),
  ],
  devServer: {
    static: path.join(__dirname, 'dist'),
    port: 3000,
  },
};
EOF

# Update package.json scripts
# Read the existing package.json, modify the scripts, and overwrite it
node -e "
const fs = require('fs');
const packageJson = JSON.parse(fs.readFileSync('package.json'));
packageJson.scripts = {
  'start': 'webpack serve --mode development',
  'electron': 'electron .',
  'build': 'webpack --mode production',
  'package': 'electron-packager . WeaviateSearchApp --platform=darwin --arch=x64 --overwrite'
};
fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
"

# Create main.js
cat <<EOF > main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadURL('http://localhost:3000');
}

app.whenReady().then(createWindow);

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
EOF

# Create public/index.html
cat <<EOF > public/index.html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Weaviate Search App</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>
EOF

# Create src/index.js
cat <<EOF > src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './styles.css';

ReactDOM.render(<App />, document.getElementById('root'));
EOF

# Create src/App.js
cat <<EOF > src/App.js
import React from 'react';
import SearchBar from './components/SearchBar';

const App = () => (
  <div className="app">
    <SearchBar />
  </div>
);

export default App;
EOF

# Create src/components/SearchBar.js
cat <<EOF > src/components/SearchBar.js
import React, { useState } from 'react';
import weaviate from 'weaviate-client';
import Results from './Results';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setError('Please enter a search term.');
      return;
    }

    setLoading(true);
    setError(null);

    const client = weaviate.client({
      scheme: 'https',
      host: process.env.WEAVIATE_URL,
      apiKey: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY),
    });

    try {
      const response = await client.graphql
        .get()
        .withClassName('Chunk')
        .withFields('content chunk_index')
        .withNearText({ concepts: [query], distance: 0.7 })
        .withLimit(10)
        .do();

      const chunks = response.data.Get.Chunk;
      setResults(chunks);
    } catch (error) {
      console.error('Search error:', error);
      setError('An error occurred while searching.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-container">
      <h1>Weaviate Search</h1>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search for content..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>
      {loading && <p>Loading results...</p>}
      {error && <p className="error">{error}</p>}
      <Results results={results} />
    </div>
  );
};

export default SearchBar;
EOF

# Create src/components/Results.js
cat <<EOF > src/components/Results.js
import React from 'react';

const Results = ({ results }) => (
  <div className="results">
    {results.length > 0 ? (
      results.map((item, index) => (
        <div key={index} className="result-item">
          <h3>Chunk {item.chunk_index}</h3>
          <p>{item.content}</p>
        </div>
      ))
    ) : (
      <p>No results found.</p>
    )}
  </div>
);

export default Results;
EOF

# Create src/styles.css
cat <<EOF > src/styles.css
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background-color: #36393f;
  color: #dcddde;
}

.app {
  text-align: center;
  padding: 20px;
}

.search-container {
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 20px;
}

form {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

input[type="text"] {
  width: 60%;
  padding: 10px;
  border: none;
  border-radius: 5px;
}

button {
  padding: 10px 20px;
  margin-left: 10px;
  border: none;
  border-radius: 5px;
  background-color: #7289da;
  color: #fff;
  cursor: pointer;
}

button:hover {
  background-color: #5b6eae;
}

.results {
  margin-top: 20px;
}

.result-item {
  background-color: #2f3136;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 5px;
  text-align: left;
}

.result-item h3 {
  margin-top: 0;
}
EOF

echo "Setup complete! Please update your .env file with your actual Weaviate URL and API key."
echo "To start the development server, run: npm run start"
echo "In another terminal, run: npm run electron"

