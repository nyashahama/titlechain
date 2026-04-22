FROM golang:1.24-alpine AS build
WORKDIR /src
COPY go.work ./
COPY services/api ./services/api
RUN cd services/api && go build -o /bin/titlechain-api ./cmd/api

FROM alpine:3.22
COPY --from=build /bin/titlechain-api /usr/local/bin/titlechain-api
EXPOSE 8080
CMD ["titlechain-api"]
