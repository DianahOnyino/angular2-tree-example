import { Component } from '@angular/core';
import * as userData from '../app/data.json'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'angular2-tree-example';
  users = userData.users;
  selectedNode: any;
  actionButtonText: string;

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
}