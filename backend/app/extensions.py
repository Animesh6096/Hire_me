from flask import Flask
from flask_pymongo import PyMongo
from flask_cors import CORS

# Initialize database connection
db = PyMongo()
cors= CORS()