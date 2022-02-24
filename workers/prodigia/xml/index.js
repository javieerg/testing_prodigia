const fs = require('fs');
const moment = require('moment');
const xml2js = require('xml2js');
const parser = new xml2js.Parser();
const builder = new xml2js.Builder();

const prodigia = require('./../../../wrappers/prodigia');

class XML {
  async readXML(issue) {
    console.log('Creating XML request...');
    return new Promise((resolve, reject) => {
      // Reading file
      let getXML = fs.readFileSync(`./documents/xmls/${issue}.xml`);
      return parser.parseStringPromise(getXML).then((x) => {
        x['cfdi:Comprobante']['$']['Fecha'] = moment().format("YYYY-MM-DD[T]HH:mm:ss");
        x['cfdi:Comprobante']['$']['Certificado'] = process.env.CERT;
        x['cfdi:Comprobante']['$']['NoCertificado'] = process.env.NoCERT;
        x['cfdi:Comprobante']['cfdi:Emisor'][0]['$']['Rfc'] = process.env.RFC;
        x['cfdi:Comprobante']['cfdi:Emisor'][0]['$']['RegimenFiscal'] = process.env.RF;
        let structure = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tim="timbrado.ws.pade.mx">` +
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
        return prodigia.sendRequest(structure);
      }).then((r) => {
        console.log('Response:', r);
        return resolve(r);
      }).catch((e) => {
        console.log(e);
        return reject('Creating payload error');
      });
    });
  }
}

module.exports = XML;