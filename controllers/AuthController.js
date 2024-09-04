/* eslint-disable*/
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis';

export default class AuthController {
  static async getConnect(req, res) {
    const { user } = req;
    const tokenID = uuidv4();

    await redisClient.set(`auth_${tokenID}`, user._id.toString(), 24 * 60 * 60);
    res.status(200).json({ tokenID });
  }

  static async getDisconnect(req, res) {
    const tokenID = req.headers['x-token'];

    await redisClient.del(`auth_${tokenID}`);
    res.status(204).send();
  }
}
