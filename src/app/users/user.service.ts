import * as faker from 'faker';

export class UserService {
    userId = 2;
    postId = 2;
    commentId = 2;

    getPostByUuid(userPosts, postUuid) {
        return userPosts.find(post => post.uuid === postUuid);
    }

    getCommentByUuid(userComments, commentUuid) {
        return userComments.find(comment => comment.uuid === commentUuid);
    }

    populateNewNode(value, currentNode, post, comment, editMode) {
        let newNode: {};

        if (editMode) {
            if (currentNode.nodeLevel == 1) {
                post.title = value.postTitle;
                post.author = value.author;

                newNode = post;
            } else if (currentNode.nodeLevel == 2) {
                comment.body = value.comment;
                newNode = comment;
            }
        } else {
            this.userId += 1;
            this.postId += 1;
            this.commentId += 1;

            newNode = {
                id: this.userId,
                uuid: faker.random.uuid(),
                name: value.username,
                posts: []
            }

            if (currentNode.nodeLevel == 1) {
                newNode = {
                    id: this.postId,
                    uuid: faker.random.uuid(),
                    title: value.postTitle,
                    author: value.author,
                    comments: []
                }
            } else if (currentNode.nodeLevel == 2) {
                newNode = {
                    id: this.commentId,
                    uuid: faker.random.uuid(),
                    body: value.comment,
                }
            }
        }

        return newNode;
    }

    pushNewNodeToUsersArray(users, currentNode, newNode) {
        let user = users.find(user => user.uuid === currentNode.userData.uuid);

        if (currentNode.nodeLevel == 0) {
            users.push(newNode);
        } else if (currentNode.nodeLevel == 1) {
            user.posts.push(newNode);
        } else {
            let post = user.posts.find(post => post.uuid === currentNode.id)
            post.comments.push(newNode);
        }
    }

    delete(selectedNodeItem) {
        let userPosts = selectedNodeItem.userData.posts;
        let successfulDelete = false;

        if (selectedNodeItem.nodeLevel == 1) {
            let post = this.getPostByUuid(userPosts, selectedNodeItem.postUuid);

            if (post.comments.length !== 0) {
                alert("This post has comments attached to it hence can't be deleted.")
                return { successfulDelete: successfulDelete };
            }

            const index: number = userPosts.indexOf(post);

            userPosts.splice(index, 1);
            successfulDelete = true;

        } else if (selectedNodeItem.nodeLevel == 2) {
            let post = this.getPostByUuid(userPosts, selectedNodeItem.postUuid);
            let userComments = post.comments;

            let comment = this.getCommentByUuid(userComments, selectedNodeItem.id)
            const index: number = userComments.indexOf(comment);

            userComments.splice(index, 1);
            successfulDelete = true;
        }

        return { successfulDelete: successfulDelete };
    }
}