docker stop mongodb-accessiblelod
docker rm mongodb-accessiblelod
rm -rf mongo_data
mkdir mongo_data
docker-compose up -d
cp ./AccessibleLOD_data.json ./mongo_data
docker exec -it mongodb-accessiblelod mongoimport --db mydatabase --collection AccessibleLOD_data --file ./mongo_data/AccessibleLOD_data.json --jsonArray --upsert