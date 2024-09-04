import mongodb from 'mongodb';
import Collection from 'mongodb/lib/collection';
import envLoader from './env_loader';

/**
 * MongoDB client.
 */
class DBClient {
  /**
   * new DBClient instance.
   */
  constructor() {
    envLoader();
    const hostName = process.env.DB_HOST || 'localhost';
    const portNumber = process.env.DB_PORT || 27017;
    const databaseName = process.env.DB_DATABASE || 'files_manager';
    const dbURLName = `mongodb://${hostName}:${portNumber}/${databaseName}`;

    this.client = new mongodb.MongoClient(dbURLName, { useUnifiedTopology: true });
    this.client.connect();
  }

  /**
   * Checks the client's connection to the MongoDB server
   * @returns {boolean}
   */
  isAlive() {
    return this.client.isConnected();
  }

  /**
   * Retrieves the number of users from the db
   * @returns {Promise<Number>}
   */
  async nbUsers() {
    return this.client.db().collection('users').countDocuments();
  }

  /**
   * Retrieves the number of files in the db.
   * @returns {Promise<Number>}
   */
  async nbFiles() {
    return this.client.db().collection('files').countDocuments();
  }

  /**
   * Retrieves a reference to the users collection.
   * @returns {Promise<Collection>}
   */
  async usersCollection() {
    return this.client.db().collection('users');
  }

  /**
   * reference to the files collection.
   * @returns {Promise<Collection>}
   */
  async filesCollection() {
    return this.client.db().collection('files');
  }
}

export const dbClient = new DBClient();
export default dbClient;
