/* eslint-disable */
import { writeFile } from 'fs';
import { promisify } from 'util';
import Queue from 'bull/lib/queue';
import imgThumbnail from 'image-thumbnail';
import mongoDBCore from 'mongodb/lib/core';
import dbClient from './utils/db';
import Mailer from './utils/mailer';

const writeFileAsync = promisify(writeFile);
const fileQueue = new Queue('thumbnail generation');
const userQueue = new Queue('email sending');

/**
 * Generates the thumbnail of an image
 * @param {String} filePath original file location.
 * @param {number} size width of the thumbnail.
 * @returns {Promise<void>}
 */
const generateThumbnail = async (filePath, size) => {
  const buffering = await imgThumbnail(filePath, { width: size });
  console.log(`Generating file: ${filePath}, size: ${size}`);
  return writeFileAsync(`${filePath}_${size}`, buffering);
};

fileQueue.process(async (job, done) => {
  const fileId = job.data.fileId || null;
  const userId = job.data.userId || null;

  if (!fileId) {
    throw new Error('Missing fileId');
  }
  if (!userId) {
    throw new Error('Missing userId');
  }
  console.log('Processing', job.data.name || '');
  const file = await (await dbClient.filesCollection())
    .findOne({
      _id: new mongoDBCore.BSON.ObjectId(fileId),
      userId: new mongoDBCore.BSON.ObjectId(userId),
    });
  if (!file) {
    throw new Error('File not found');
  }
  const sizes = [500, 250, 100];
  Promise.all(sizes.map((size) => generateThumbnail(file.localPath, size)))
    .then(() => {
      done();
    });
});

userQueue.process(async (job, done) => {
  const userId = job.data.userId || null;

  if (!userId) {
    throw new Error('Missing userId');
  }
  const user = await (await dbClient.usersCollection())
    .findOne({ _id: new mongoDBCore.BSON.ObjectId(userId) });
  if (!user) {
    throw new Error('User not found');
  }
  console.log(`Welcome ${user.email}!`);
  try {
    const subject = 'Welcome to ALX-Files_Manager by Richard';
    const content = [
      '<div>',
      '<h3>Hello {{user.name}},</h3>',
      'Welcome to <a href="https://github.com/ritchie254/alx-files_manager">',
      'ALX-Files_Manager</a>, ',
      'a simple file management API built with Node.js by ',
      '<a href="https://github.com/B3zaleel">RICHARD ODUOR</a>. ',
      '</div>',
    ].join('');
    Mailer.sendMail(Mailer.buildMessage(user.email, subject, content));
    done();
  } catch (err) {
    done(err);
  }
});
