function createDocumentText(el) {
  var body = el.documentElement.outerHTML;
  if (el.doctype) {
    var doctype = {
      name: el.doctype.name,
      publicId: el.doctype.publicId,
      systemId: el.doctype.systemId
    };
    var dctype = '<!DOCTYPE ' + doctype.name;
    if (doctype.publicId.length) dctype += ' PUBLIC "' + doctype.publicId + '"';
    if (doctype.systemId.length) dctype += ' "' + doctype.systemId + '"';
    dctype += ">\r\n";
    return dctype + body;
  }
  return body;
}