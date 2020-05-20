import { Component, ViewChild } from '@angular/core';
import * as userData from '../app/data.json'
import { NgForm } from '@angular/forms';
import * as faker from 'faker';
import { Subject, Subscription, interval } from 'rxjs';
import { UsersComponent } from './users/users.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'angular2-tree-example';
  users;
  selectedNode: any;
  actionButtonText: string;
  showForm: boolean = false;
  userId = 2;
  postId = 2;
  commentId = 2;
  nodeLevel;
  editMode = false;
  post: any;
  comment: any;

  usersChanged = new Subject<{}>();
  private usersChangeSubscription: Subscription;
  private subscription: Subscription;

  @ViewChild(UsersComponent, { static: false })
  private tree: UsersComponent;

  @ViewChild('f', { static: false }) form: NgForm

  ngOnInit() {
    this.users = userData.users;

    this.usersChangeSubscription = this.usersChanged
      .subscribe(
        (users) => {
          this.users = users;
        }
      )
  }

  receiveSelectedNode($event) {
    this.selectedNode = $event.selectedNode;

    if (this.selectedNode.nodeLevel == 0) {
      this.actionButtonText = "Add Post";
    } else if (this.selectedNode.nodeLevel == 1) {
      this.actionButtonText = "Add Comment";
    }

    //Allow modelling of input values upon change of selected node while on editMode
    if (this.editMode) {
      if (this.selectedNode.nodeLevel !== 0) {
        this.toggleEditMode(this.form, this.selectedNode)
      } else {
        this.editMode = false;
        this.showForm = false;
      }
    }
  }

  getPostNameByUuid(userPosts, postUuid) {
    const post = this.getPostByUuid(userPosts, postUuid);
    return post ? post.title : '';
  }

  getPostByUuid(userPosts, postUuid) {
    return userPosts.find(post => post.uuid === postUuid);
  }

  getCommentByUuid(userComments, commentUuid) {
    return userComments.find(comment => comment.uuid === commentUuid);
  }

  displayForm(nodeLevel) {
    this.showForm = true;
    this.selectedNode.nodeLevel = nodeLevel;
  }

  toggleEditMode(form, selectedNode) {
    const setFormValuesInterval = interval();
    this.post = this.getPostByUuid(selectedNode.userData.posts, selectedNode.postUuid);
    this.comment = this.getCommentByUuid(this.post.comments, selectedNode.id)

    this.subscription = setFormValuesInterval
      .subscribe(() => {
        if (selectedNode.nodeLevel == 2) {
          form.control.patchValue({
            comment: selectedNode.name,
          });
        } else if (selectedNode.nodeLevel == 1) {
          form.control.patchValue({
            postTitle: selectedNode.name,
            author: this.post.author
          });
        }

        //Unsubscribe after task completion
        this.subscription.unsubscribe();
      })

    this.editMode = true;
    this.showForm = true;
  }

  addNode(currentNode, newNode) {
    let nodeId = newNode.uuid;

    if (!this.editMode) {
      let user = this.users.find(user => user.uuid === currentNode.userData.uuid);

      if (currentNode.nodeLevel == 0) {
        this.users.push(newNode);
      } else if (currentNode.nodeLevel == 1) {
        user.posts.push(newNode);
      } else {
        let post = user.posts.find(post => post.uuid === currentNode.id)
        post.comments.push(newNode);
      }
    } else {
      this.editMode = false;
    }

    this.tree.populateNodesStructure(this.users);

    this.tree.treeModel.update();
    this.tree.expandCreatedNode(nodeId);
  }

  onSubmit(form: NgForm) {
    const value = form.value;
    let currentNode = this.selectedNode;
    let newNode: {};

    if (this.editMode) {
      if (currentNode.nodeLevel == 1) {
        this.post.title = value.postTitle;
        this.post.author = value.author;

        newNode = this.post;
      } else if (currentNode.nodeLevel == 2) {
        this.comment.body = value.comment;
        newNode = this.comment;
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

    this.addNode(currentNode, newNode);
    this.usersChanged.next(this.users.slice());

    this.showForm = false;
    form.reset();
  }

  onCancel(form: NgForm) {
    form.reset();
    this.showForm = false;
    this.editMode = false;
  }

  onDelete(selectedNodeItem) {
    let userPosts = selectedNodeItem.userData.posts;

    if (selectedNodeItem.nodeLevel == 1) {
      let post = this.getPostByUuid(userPosts, selectedNodeItem.postUuid);

      if (post.comments) {
        return "This post has comments attached to it hence can't be deleted."
      }

      const index: number = userPosts.indexOf(post);

      userPosts.splice(index, 1);
    } else if (selectedNodeItem.nodeLevel == 2) {
      let post = this.getPostByUuid(userPosts, selectedNodeItem.postUuid);
      let userComments = post.comments;

      let comment = this.getCommentByUuid(userComments, selectedNodeItem.id)
      const index: number = userComments.indexOf(comment);

      userComments.splice(index, 1);
    }

    this.usersChanged.next(this.users.slice());

    this.tree.populateNodesStructure(this.users);
    this.tree.treeModel.update();
  }

  ngOnDestroy(): void {
    this.usersChangeSubscription.unsubscribe();
  }
}