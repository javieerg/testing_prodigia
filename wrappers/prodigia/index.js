const axios = require('axios');
const xml2js = require('xml2js');
const parser = new xml2js.Parser();

class Prodigia {
  async sendRequest(data) {
    try {
      let getURL, getService;
      switch (process.env.TYPE) {
        case 'xml33':
          getURL = process.env.SERVICE.XML33.URL;
          getService = process.env.SERVICE.XML33.NAME;
          break;

        default:
          break;
      }
      console.log('Endpoint:', getURL);
      let response = await axios.post(getURL, data, { headers: { 'Content-Type': 'text/xml' } });
      let getData = await parser.parseStringPromise(response.data);
      let getXML = await parser.parseStringPromise(getData['S:Envelope']['S:Body'][0][`ns2:${getService}Response`][0]['return'][0]);
      return getXML;
    } catch (e) {
      return 'Sending request error';
    }
  }
}

let prodigia = new Prodigia;

module.exports = prodigia;