const fs = require('fs');
const axios = require('axios');
const moment = require('moment');
const csv = require('csv-string');
const xml2js = require('xml2js');
const xmljs = require('xml-js');
const parser = new xml2js.Parser();
const builder = new xml2js.Builder();

const { CERT, NoCERT, RFC, RF, SERVICE } = require('./../config/dev.json');

class XML {
  async readXML(issue) {
    console.log('Creating XML request...');
    return new Promise((resolve, reject) => {
      // Read file
      let getXML = fs.readFileSync(`./documents/xmls/${issue}.xml`);
      let padeURL = process.env.SERVICE == 'timbrado40' ? 'timbrado.ws.pade.mx' : 'timbrado.ws.pade.mx';
      return parser.parseStringPromise(getXML).then((x) => {
        x['cfdi:Comprobante']['$']['Fecha'] = moment().format("YYYY-MM-DD[T]HH:mm:ss");
        x['cfdi:Comprobante']['$']['Certificado'] = CERT;
        x['cfdi:Comprobante']['$']['NoCertificado'] = NoCERT;
        x['cfdi:Comprobante']['cfdi:Emisor'][0]['$']['Rfc'] = RFC;
        x['cfdi:Comprobante']['cfdi:Emisor'][0]['$']['RegimenFiscal'] = RF;
        let structure = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tim="${padeURL}">` +
          '<soapenv:Header/>' +
          '<soapenv:Body>' +
          '<tim:timbradoPrueba>' +
          '<!--Optional:-->' +
          '<contrato>9f686960-169e-11e2-ae20-109add4fad20</contrato>' +
          '<!--Optional:-->' +
          '<usuario>unixlibre</usuario>' +
          '<!--Optional:-->' +
          '<passwd>A1234567890$</passwd>' +
          '<!--Optional:-->' +
          '<cfdiXml><![CDATA[' + builder.buildObject(x) + ']]></cfdiXml>' +
          '<!--Zero or more repetitions:-->' +
          '<opciones>CALCULAR_SELLO</opciones>' +
          // '<opciones>GENERAR_PDF:Toven</opciones>' +
          // '<opciones>ENVIAR_AMBOS:javier.garcia@prodigia.com.mx</opciones>' +
          '</tim:timbradoPrueba>' +
          '</soapenv:Body>' +
          '</soapenv:Envelope>';
        // console.log("structure:", structure);
        return this.sendRequest(structure);
      }).then((r) => {
        console.log('Response:', r);
        return resolve(r);
      }).catch((e) => {
        console.log(e);
        return reject('Creating payload error');
      });
    });
  }

  async sendRequest(data) {
    try {
      console.log(`Sending request to ${process.env.SERVER} environment`);
      let getURL, getService;
      switch (process.env.SERVICE) {
        case 'timbrado':
          getURL = `${process.env.SERVER == 'local' ? SERVICE.TIMBRADO.LOCAL : SERVICE.TIMBRADO.DEV}`;
          getService = SERVICE.TIMBRADO.NAME;
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

module.exports = XML;