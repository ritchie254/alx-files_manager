import { promisify } from 'util';
import { createClient } from 'redis';

/**
 * a Redis client.
 */
class RedisClient {
  /**
   * new RedisClient instance.
   */
  constructor() {
    this.client = createClient();
    this.clientConnected = true;
    this.client.on('error', (err) => {
      console.error('Redis client failed to connect:', err.message || err.toString());
      this.clientConnected = false;
    });
    this.client.on('connect', () => {
      this.clientConnected = true;
    });
  }

  /**
   * Checks if this client's connection to the Redis server
   * @returns {boolean}
   */
  isAlive() {
    return this.clientConnected;
  }

  /**
   * Retrieves the value
   * @param {String} key The key of the item to retrieve.
   * @returns {String | Object}
   */
  async get(key) {
    return promisify(this.client.GET).bind(this.client)(key);
  }

  /**
   * Stores a key and its value
   * @param {String} key The key of the item to store.
   * @param {String | Number | Boolean} value The item to store.
   * @param {Number} duration The expiration time of the item
   * @returns {Promise<void>}
   */
  async set(key, value, duration) {
    await promisify(this.client.SETEX)
      .bind(this.client)(key, duration, value);
  }

  /**
   * Removes the value of a key.
   * @param {String} key The key of the item to remove.
   * @returns {Promise<void>}
   */
  async del(key) {
    await promisify(this.client.DEL).bind(this.client)(key);
  }
}

export const redisClient = new RedisClient();
export default redisClient;
