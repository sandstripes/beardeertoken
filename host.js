#!/bin/node
const e=require('express');const a=e();a.use(e.static('.'));a.listen(8036,_=>console.log('hosting'));
