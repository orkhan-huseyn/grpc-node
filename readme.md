# Learning NodeJs gRPC

To generate code you need `protoc` compiler. After you have it you can run the following command in your terminal:

```sh
protoc -I=. ./protos/greet.proto --js_out=import_style=commonjs,binary:./server --grpc_out=./server --plugin=protoc-gen-grpc=`which grpc_tools_node_protoc_plugin`
```
