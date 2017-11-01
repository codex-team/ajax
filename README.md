# codex.ajax

Native AJAX module

## Usage

```js
ajax.call({
   type: 'POST',
   url: '/target/url',
   data: {},
   before: function () {},
   progress: function (percentage) {
       console.log(percentage + '%');
       // ...
   },
   success: function (response) {
       response = JSON.parse(response);
       console.log(response);
       // ...
   },
   error: function (response) {
       response = JSON.parse(response);
       console.log(response);
       // ...
   },
   after: function () {},
});
```
