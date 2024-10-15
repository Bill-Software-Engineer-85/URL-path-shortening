import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const App: React.FC = () => {
  const [url, setUrl] = useState('');
  const [shortenedUrl, setShortenedUrl] = useState('');
  const [stats, setStats] = useState([]);
  const [error, setError] = useState('');

  const runtimeConfig = window.ENV || {
    BACKEND_URL: 'http://localhost:8080', // default value if not set
  };
  const backendUrl = runtimeConfig.BACKEND_URL;

  const handleShortenUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setShortenedUrl(''); // Clear previous shortened URL

    if (!url.trim()) {
      setError('URL cannot be blank');
      return;
    }

    try {
      const response = await axios.post(`${backendUrl}/shorten`, { url });
      setShortenedUrl(response.data.shortenedUrl);
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        setError('Invalid URL format. Please enter a valid URL.');
      } else {
        console.error('Error shortening URL', error);
        setError('An unexpected error occurred. Please try again later.');
      }
    }
  };

  const handleGetStats = async () => {
    try {
      const response = await axios.get(`${backendUrl}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats', error);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      const response = await axios.get(`${backendUrl}/download/csv`, {
        responseType: 'blob',
      });

      // Create a link element to trigger the download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'shortened_urls.csv'); // Set the file name
      document.body.appendChild(link);
      link.click();

      // Clean up
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Error downloading CSV', error);
    }
  };

  return (
    <div className="app-container">
      <div className="card">
        <h1>URL Shortener</h1>
        <form onSubmit={handleShortenUrl} className="shorten-form">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL"
            className="url-input"
          />
          <button type="submit" className="shorten-button">Shorten URL</button>
        </form>
        {error && <div className="error-message">{error}</div>}
        {shortenedUrl && (
          <div className="result">
            <h2>Shortened URL:</h2>
            <a href={shortenedUrl} target="_blank" rel="noopener noreferrer">
              {shortenedUrl}
            </a>
          </div>
        )}
      </div>
      <div className="card">
        <button onClick={handleGetStats} className="stats-button">Get Stats</button>
        <button onClick={handleDownloadCSV} className="download-button">Download CSV</button>
        {stats.length > 0 && (
          <div className="stats">
            <h2>Stats</h2>
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Slug</th>
                  <th>Original URL</th>
                  <th>Visit Count</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((stat: any, index) => (
                  <tr key={index}>
                    <td>
                      <a
                        href={`${backendUrl}/${stat.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {stat.slug}
                      </a>
                    </td>
                    <td>
                      <a href={stat.original_url} target="_blank" rel="noopener noreferrer">
                        {stat.original_url}
                      </a>
                    </td>
                    <td>{stat.visit_count}</td>
                    <td>
                      {new Intl.DateTimeFormat('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      }).format(new Date(stat.created_at))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <footer className="footer">
        <p>Made by Bill Yu</p>
        <p>
          Contact: <a href="mailto:BillSoftwareEngineer@outlook.com">BillSoftwareEngineer@outlook.com</a>
        </p>
      </footer>
    </div>
  );
};

export default App;
