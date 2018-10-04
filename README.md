# Ajax

Easy module for async requests on native JavaScript.

## Installation

You can install this package via NPM or Yarn

```shell
npm i --save-dev @codexteam/ajax
```

```shell
yarn add @codexteam/ajax
```

Also you can get module [from CDN](https://unpkg.com/@codexteam/ajax) or download a [bundle file](dist/main.js) and use it locally.

Require package on your script page.

```javascript
const ajax = require('@codexteam/ajax');
```

## Usage

There are a few public functions to be used by user. All of them return promises.

### ajax.request()

Main function for all requests.

| param    | type              | required | default value        | description                           | 
| -------- | ----------------- | -------- | -------------------- | ------------------------------------- |
| url      | `string`          | **true** |                      | Request URL                           |
| method   | `string`          | false    | `'GET'`              | Request method                        |
| data     | `string|FormData` | false    | `null`               | Data to be sent                       |
| headers  | `object`          | false    | `null`               | Custom headers object                 |
| progress | `function`        | false    | `(percentage) => {}` | Progress callback                     |
| ratio    | `number`          | false    | `90`                 | Max % of bar for *uploading* progress |

```javascript
const params = {
  url: '/joinSurvey',
  method: 'POST',
  data: JSON.stringify({
    user: 22
  }),
  headers: {
    'content-type': 'application/json; charset=utf-8'
  }
};

ajax.request(params)
  .then(successCallback)
  .catch(errorCallback);
```


### ajax.get()

Wrapper for a GET request over an `ajax.request()` function.

| param    | type       | required | default value        | description                         | 
| -------- | ---------- | -------- | -------------------- | ----------------------------------- |
| url      | `string`   | **true** |                      | Request URL                         |
| data     | `object`   | false    | `null`               | Data to be sent                     |
| headers  | `object`   | false    | `null`               | Custom headers object               |
| progress | `function` | false    | `(percentage) => {}` | Progress callback                   |
| ratio    | `number`   | false    | `90`                 | Max % of bar for uploading progress |

#### Example

```javascript
const params = {
  url: '/getUserData',
  data: {
    user: 22
  }
};

ajax.get(params)
  .then(successCallback)
  .catch(errorCallback);
```

### ajax.post()

Wrapper for a POST request over an `ajax.request()` function.

| param    | type                | required | default value                         | description                           | 
| -------- | ------------------- | -------- | ------------------------------------- | ------------------------------------- |
| url      | `string`            | **true** |                                       | Request URL                           |
| data     | `object|FormData`   | false    | `null`                                | Data to be sent                       |
| type     | `string`            | false    | `'application/x-www-form-urlencoded'` | Header from `ajax.contentType` object |
| headers  | `object`            | false    | `null`                                | Custom headers object                 |
| progress | `function`          | false    | `(percentage) => {}`                  | Progress callback                     |
| ratio    | `number`            | false    | `90`                                  | Max % of bar for *uploading* progress | 

You can get value for the param `type` from `ajax.contentType` object. Data will be encoded that way.

| ajax.contentType | value                               |
| ---------------- | ----------------------------------- |
| URLENCODED       | `application/x-www-form-urlencoded` |
| JSON             | `application/json; charset=utf-8`   |
| FORM             | `multipart/form-data`               |

#### Example

```javascript
const params = {
  url: '/saveArticle',
  data: {
    title: 'Awesome article',
    text: 'will be written later',
    isPublished: false
  },
  
  /** Choose the content type you need */
  type: ajax.contentType.URLENCODED
  // type: ajax.contentType.JSON
  // type: ajax.contentType.FORM
};

ajax.post(params)
  .then(successCallback)
  .catch(errorCallback);
```

### ajax.transport()

This is a function for uploading files from client. 

User will be asked to choose a file (or multiple) to be uploaded. Then FormData object will be sent to the server via `ajax.post()` function.

| param     | type       | required | default value        | description                           | 
| --------  | ---------- | -------- | -------------------- | ------------------------------------- |
| url       | `string`   | **true** |                      | Request URL                           |
| data      | `object`   | false    | `null`               | Additional data to be sent            |
| accept    | `string`   | false    | `null`               | Mime-types of accepted files          |
| multiple  | `boolean`  | false    | `false`              | Let user choose more than one file    |
| fieldName | `string`   | false    | `'files'`            | Name of field in form with files      |
| headers   | `object`   | false    | `null`               | Custom headers object                 |
| progress  | `function` | false    | `(percentage) => {}` | Progress callback                     |
| ratio     | `number`   | false    | `90`                 | Max % of bar for *uploading* progress |

Some examples for param `accept`:
- `*/*` — any files
- `image/*` — only images
- `image/jpg, image/png, image/bmp` — restrict target types 

#### Example

```javascript
const params = {
  url: '/uploadImage',
  multiple: true,
  accept: 'image/*',
  progress: function (percentage) {
    document.title = `${percentage}%`;
  },
  ratio: 95,
  fieldName: 'images'
};

ajax.transport(params)
  .then(successCallback)
  .catch(errorCallback);
```
