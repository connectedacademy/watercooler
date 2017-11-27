# GET VERSION:

apk add --no-cache curl

PACKAGE_VERSION=$(cat package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[[:space:]]')

echo "BUILDING FOR VERSION $PACKAGE_VERSION"

# pull latest version
ISTHERE=$(curl -s --head -w %{http_code} https://hub.docker.com/v2/repositories/connectedacademy/watercooler/tags/$PACKAGE_VERSION/ -o /dev/null)

if [ $ISTHERE -ne '200' ]
then
    echo "VERSION DOES NOT EXIST, TAGGING"
    docker pull $CONTAINER_TEST_IMAGE
    docker login -u $DOCKER_USERNAME -p "$DOCKER_PASSWORD"
    docker tag $CONTAINER_TEST_IMAGE $CONTAINER_DOCKERHUB_RELEASE:$PACKAGE_VERSION
    docker tag $CONTAINER_TEST_IMAGE $CONTAINER_DOCKERHUB_RELEASE
    docker push $CONTAINER_DOCKERHUB_RELEASE:$PACKAGE_VERSION
    docker push $CONTAINER_DOCKERHUB_RELEASE
else
    echo "INCREMENT VERSION USING npm version BEFORE RE-RUNNING"
    exit 1
fi