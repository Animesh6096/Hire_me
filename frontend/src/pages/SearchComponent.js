import React, { useState } from "react";
import axios from "axios";
import "./SearchComponent.css"; // Adjust based on the CSS organization in your repository

const SearchComponent = () => {
  const [searchType, setSearchType] = useState("post"); // 'post' or 'person'
  const [keyword, setKeyword] = useState("");
  const [taskType, setTaskType] = useState("");
  const [skills, setSkills] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    const params = {
      type: searchType,
      keyword,
      task_type: taskType,
      skills: skills.split(","),
      location,
      category,
    };

    try {
      const response = await axios.get("/api/search", { params });
      setResults(response.data);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  return (
    <div className="search-container">
      <h2 className="search-title">Search</h2>
      <div className="search-filters">
        <select
          className="filter-dropdown"
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
        >
          <option value="post">Posts</option>
          <option value="person">People</option>
        </select>
        <input
          type="text"
          className="filter-input"
          placeholder="Keyword"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <input
          type="text"
          className="filter-input"
          placeholder="Skills (comma-separated)"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
        />
        {searchType === "post" && (
          <>
            <select
              className="filter-dropdown"
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
            >
              <option value="">Task Type</option>
              <option value="remote">Remote</option>
              <option value="onsite">Onsite</option>
            </select>
            <input
              type="text"
              className="filter-input"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <input
              type="text"
              className="filter-input"
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </>
        )}
        <button className="search-button" onClick={handleSearch}>
          Search
        </button>
      </div>
      <div className="search-results">
        {results.map((result, index) => (
          <div key={index} className="result-card">
            <h3>{result.title || result.name}</h3>
            <p>{result.description || result.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchComponent;
