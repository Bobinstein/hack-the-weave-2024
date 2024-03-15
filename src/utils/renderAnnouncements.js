// src/utils/renderAnnouncements.js
import React from 'react';

const renderAnnouncements = ({ announcements }) => (
  <div>
    <h2>Announcements</h2>
    {announcements && announcements.length > 0 ? (
      <ul>
        {announcements.map((announcement, index) => (
          <li
            key={index}
            style={{
              color: /hit/i.test(announcement)
                ? "red"
                : /attack/i.test(announcement)
                ? "green"
                : "white",
            }}
          >
            {announcement}
          </li>
        ))}
      </ul>
    ) : (
      <p>No announcements</p>
    )}
  </div>
);

export default renderAnnouncements;
