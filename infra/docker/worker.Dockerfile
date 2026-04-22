FROM rust:1.88-alpine AS build
WORKDIR /src
COPY Cargo.toml ./
COPY crates ./crates
COPY workers ./workers
RUN cargo build --release -p deeds-pipeline

FROM alpine:3.22
COPY --from=build /src/target/release/deeds-pipeline /usr/local/bin/deeds-pipeline
EXPOSE 9091
CMD ["deeds-pipeline"]
