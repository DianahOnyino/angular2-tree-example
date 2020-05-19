import { Component, ViewChild } from '@angular/core';
import * as userData from '../app/data.json'
import { NgForm } from '@angular/forms';
import * as faker from 'faker';
import { Subject, Subscription } from 'rxjs';
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

  usersChanged = new Subject<{}>();
  private usersChangeSubscription: Subscription;

  @ViewChild(UsersComponent, { static: false })
  private tree: UsersComponent;

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
  }

  getPostNameByUuid(userPosts, postUuid) {
    return userPosts.find(post => post.uuid === postUuid).title;
  }

  displayForm(nodeLevel) {
    this.showForm = true;
    this.selectedNode.nodeLevel = nodeLevel;
  }

  addNode(currentNode, newNode) {
    const nodeId = newNode.uuid;
    let user = this.users.find(user => user.uuid === currentNode.userData.uuid);

    if (currentNode.nodeLevel == 0) {
      this.users.push(newNode);
    } else if (currentNode.nodeLevel == 1) {
      user.posts.push(newNode);
    } else {
      let post = user.posts.find(post => post.uuid === currentNode.id)
      post.comments.push(newNode);
    }

    this.tree.populateNodesStructure(this.users);

    this.tree.treeModel.update();
    this.tree.expandCreatedNode(nodeId);
  }

  onSubmit(form: NgForm) {
    let currentNode = this.selectedNode;
    const value = form.value;
    this.userId += 1;
    this.postId += 1;
    this.commentId += 1;

    let newNode: any = {
      id: this.userId,
      uuid: faker.random.uuid(),
      name: value.username,
      posts: []
    }

    if (currentNode.nodeLevel == 1) {
      newNode = {
        id: this.postId,
        uuid: faker.random.uuid(),
        title: value.title,
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

    this.addNode(currentNode, newNode);
    this.usersChanged.next(this.users.slice());

    this.showForm = false;
    form.reset();
  }

  ngOnDestroy(): void {
    this.usersChangeSubscription.unsubscribe();
  }
}