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

  receiveSelectedNode($event) {
    this.selectedNode = $event.selectedNode;
  }

  getPostNameByUuid(userPosts, postUuid) {
    return userPosts.find(post => post.uuid === postUuid).title;
  }
}