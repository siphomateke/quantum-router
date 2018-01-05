import ExtendableError from 'es6-error';

export class RouterControllerError extends ExtendableError {
  constructor(code, message) {
    super(typeof message !== 'undefined' ? message : code);
    this.code = code;
  }
}

export class RouterApiError extends RouterControllerError {}

export class XhrError extends ExtendableError {
  constructor(code, message) {
    super(typeof message !== 'undefined' ? message : code);
    this.code = code;
  }
}

/* const errors = [
  'xhr_error',
  'xhr_invalid_xml',
  'xhr_invalid_status',
  'xml_type_invalid',
  'xml_response_not_ok',
  'tabs_not_found',
  'chrome_runtime_message_error',
  'chrome_tabs_message_error',
  'router_url_not_set',
  'chrome_storage_error',
  'invalid_router_url',
  'xhr_timeout',
  'ussd_timeout',
  'ussd_release_fail',
];*/
