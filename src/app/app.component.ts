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
      this.actionButtonText = "Add User";
    } else if (this.selectedNode.nodeLevel == 1) {
      this.actionButtonText = "Add Post";
    } else {
      this.actionButtonText = "Add Comment";
    }
  }

  getPostNameByUuid(userPosts, postUuid) {
    return userPosts.find(post => post.uuid === postUuid).title;
  }

  displayForm(currentNodeLevel) {
    this.showForm = true;
    this.nodeLevel = currentNodeLevel;
  }

  addNode(newNode) {
    const nodeId = newNode.uuid;
    this.users.push(newNode);

    this.tree.populateNodesStructure(this.users);

    this.tree.treeModel.update();
    this.tree.expandCreatedNode(nodeId);
  }

  onSubmit(form: NgForm) {
    const value = form.value;
    this.userId += 1;

    const newNode = {
      id: this.userId,
      uuid: faker.random.uuid(),
      name: value.username,
      posts: []
    }

    this.addNode(newNode);
    this.usersChanged.next(this.users.slice());

    this.showForm = false;
    form.reset();
  }

  ngOnDestroy(): void {
    this.usersChangeSubscription.unsubscribe();
  }
}