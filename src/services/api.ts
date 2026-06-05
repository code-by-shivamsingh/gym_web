

import { KEY_HEADERS, KEY_BODY } from '@/constants/common';
import { isEmpty } from '@/utils/helper';
export const CONTENT_TYPE_URL_ENCODED = 'application/x-www-form-urlencoded;charset=UTF-8';
export const CONTENT_TYPE_APPLICATION = 'application/json';

/**
 * @param {object} data json object that contains key value for request to server
 * This will take data as JSON Object and return in Form of json Object and encode the url
 * @returns {object} This function will return object that hold url encoded data
 */
export const getFormDataObjForUrlEn = (data:any) => {
  const formData = Object.keys(data)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
    .join('&');
  return formData;
};

/**
 * @param {object} data json object that contains key value for get Form object
 * @returns {object} this will return Form object that will use for Muiltipart request
 * This will take data as JSON Object and return in Form Data Object or Multipart Object
 */
export const getFormDataFromObject = (data:any) => {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    if (typeof data[key] === 'object') {
      let dataValue = data[key];
      if (dataValue != null) {
        dataValue = JSON.stringify(dataValue);
        dataValue = dataValue.replace(/\\/g, '');
      }
      if (dataValue !== undefined && dataValue !== null) {
        formData.append(key, dataValue);
      }
    } else if (data[key] !== undefined && data[key] !== null) {
      formData.append(key, data[key]);
    }
  });
  return formData;
};

/**
 *This function for get data from server without dispatch
 *
 * @param {string} apiUrl for fetching data
 * @param {object} reqObj is an json object that contains request for call Api
 * @returns {object} This will return an response object
 */
export const fetchDataFromServerWithoutDispatch = async (apiUrl:any, reqObj:any) => {
  if (!apiUrl || !reqObj) {
    throw {
      failed: true,
      message: 'Invalid arguments',
      apiUrl,
    };
  }

  const response = await fetch(apiUrl, reqObj);

  if (response.status === 204) {
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    throw {
      failed: true,
      status: response.status,
      statusText: response.statusText,
      apiUrl,
      data,
    };
  }

  return data;
};


/**
 * @param {object} data json object that contains key value for request to server
 * @param {string} apiUrl Api url for request
 * @param {string} methodType Method type like post, get or delete etc.
 * @param {object} extraHeades Extra header that holds header information
 * @param {object} abortController This is an object that hold abort controller information
 * @returns {object} This will return response data that get from server
 */
export const fetchApi = async <T = any>(
  data: any,
  apiUrl: string,
  methodType: string,
  extraHeaders: Record<string, string> = {},
  signal?: AbortSignal
): Promise<T> => {

  const isFormData = data instanceof FormData;

  const reqObj: any = {
    method: methodType,
    cache: "no-store",
    headers: {
      ...extraHeaders,
    },
    signal,
  };

  // ONLY set JSON header if NOT FormData
  if (!isFormData) {
    reqObj.headers["Content-Type"] = "application/json";
  }

  // BODY HANDLING (IMPORTANT FIX)
  if (["post", "put", "patch", "delete"].includes(methodType.toLowerCase())) {
    if (isFormData) {
      reqObj.body = data;
    } else {
      reqObj.body = JSON.stringify(data);
    }
  }

  const response = await fetch(apiUrl, reqObj);

  const text = await response.text(); // safer than .json()

  let parsed;
  try {
    parsed = text ? JSON.parse(text) : {};
  } catch {
    parsed = text;
  }

  if (!response.ok) {
    throw {
      status: response.status,
      message: parsed?.message || "Request failed",
      data: parsed,
    };
  }

  return parsed;
};
/**
 * This funciton return api response ( promise )
 *
 * @param {string} apiUrl for fetching data
 * @param {object} reqObj is an json object that contains request for call Api
 * @returns {object} This will return response data that get from server
 */
export const fetchDataFromServerWithoutDispatch_Promise = (apiUrl:string, reqObj:any) =>
  fetch(apiUrl, reqObj).then(async (response) => {
    if (response.status === 204) return null;

    const data = await response.json();

    if (!response.ok) {
      return Promise.reject({
        status: response.status,
        statusText: response.statusText,
        data,
      });
    }

    return data;
  });


/**
 * This function for call api without dispatch with promise
 *
 * @param {object} data json object that contains key value for request to server
 * @param {string} apiUrl Api url for request
 * @param {string} methodType Method type like post, get or delete etc.
 * @param {object} extraHeades Extra header that holds header information
 * @param {object} abortController This is an object that hold abort controller information
 * @returns {object} This will return response data that get from server
 */
export const callApiWithoutDispatch_Promise = async (
  data:any,
  apiUrl:any,
  methodType:any,
  extraHeades:any,
  abortController:any
) => {
 const reqObj: any = {
  method: methodType,

  cache: "no-store",

  headers: {
    'Content-Type':
      CONTENT_TYPE_APPLICATION,

    Accept:
      CONTENT_TYPE_APPLICATION,
  },
};
  if (abortController) {
    reqObj.signal = abortController.signal;
  }
  
    reqObj.headers = {
      'Content-Type': CONTENT_TYPE_APPLICATION,
      Accept: CONTENT_TYPE_APPLICATION,
    };
  
  if (!isEmpty(extraHeades) && extraHeades && Object.keys(extraHeades).length > 0) {
    reqObj.headers = { ...reqObj.headers, ...extraHeades };
  }
  if (methodType === 'post') {
    if (data !== undefined && data !== null) {
      let formData;
      if (
        reqObj[KEY_HEADERS] &&
        reqObj[KEY_HEADERS]['Content-Type'] &&
        reqObj[KEY_HEADERS]['Content-Type'] === CONTENT_TYPE_URL_ENCODED
      ) {
        formData = getFormDataObjForUrlEn(data);
      } else if (
        reqObj[KEY_HEADERS] &&
        reqObj[KEY_HEADERS]['Content-Type'] &&
        reqObj[KEY_HEADERS]['Content-Type'] === CONTENT_TYPE_APPLICATION
      ) {
        formData = JSON.stringify(data);
      } else {
        formData = getFormDataFromObject(data);
      }
      reqObj[KEY_BODY] = formData;
    }
    return fetchDataFromServerWithoutDispatch_Promise(apiUrl, reqObj);
  }
  if (methodType === 'get') {
    return fetchDataFromServerWithoutDispatch_Promise(apiUrl, reqObj);
  }
  return null;
};
