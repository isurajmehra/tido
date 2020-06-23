const request = require('request');
const cheerio = require('cheerio');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const { Buffer } = require('buffer');
const preset = require(path.join(__dirname, 'preset.json'));

const savePath = path.join(process.argv[2], 'downloads');

if (!fs.existsSync(savePath)) fs.mkdirSync(savePath);

const fetchPageSource = url =>
  new Promise((resolve, reject) => {
    console.log(
      `[${chalk.blue(
        new Date().toLocaleTimeString('vi'),
      )}] Fetching page source...`,
    );

    request(
      {
        url,
        ...preset,
      },
      (err, res, body) => {
        if (err) return reject(err);

        return resolve(body);
      },
    );
  });

const parsePageSource = source =>
  new Promise((resolve, reject) => {
    console.log(
      `[${chalk.blue(
        new Date().toLocaleTimeString('vi'),
      )}] Parsing page source...`,
    );

    const $ = cheerio.load(source);
    const detail = $('#videoObject');

    if (detail.length !== 1)
      return reject(new Error('Cannot find video detail'));

    const videoDetail = JSON.parse(detail.html());
    const videoURL = videoDetail.contentUrl;
    const videoName = videoDetail.name.slice(0, 10);
    resolve({ name: `${+new Date()}`, url: videoURL });
  });

const downloadVideo = ({ name, url }) =>
  new Promise((resolve, reject) => {
    console.log(
      `[${chalk.blue(
        new Date().toLocaleTimeString('vi'),
      )}] Downloading video...`,
    );

    const buffer = [];
    const response = request(
      {
        url,
        ...preset,
      },
      err => {
        if (err) return reject(err);
      },
    );

    response.on('data', data => buffer.push(data));
    response.on('error', err => reject(err));
    response.on('complete', () =>
      resolve({ where: name, buffer: Buffer.concat(buffer) }),
    );
  });

const saveVideo = ({ where, buffer }) =>
  new Promise((resolve, reject) => {
    console.log(
      `[${chalk.blue(new Date().toLocaleTimeString('vi'))}] Saving video...`,
    );
    fs.writeFileSync(path.join(savePath, `${where}.tido.mp4`), buffer);
    console.log(
      `[${chalk.blue(new Date().toLocaleTimeString('vi'))}] Video saved!`,
    );
  });

fetchPageSource(process.argv[3])
  .then(parsePageSource)
  .then(downloadVideo)
  .then(saveVideo);
