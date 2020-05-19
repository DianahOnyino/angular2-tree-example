import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import * as userData from '../data.json'
import { TreeNode, TreeComponent } from 'angular-tree-component';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-users-tree',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})

export class UsersComponent implements OnInit {
  nodes;
  options;
  users;
  treeModel: any;
  @ViewChild(TreeComponent, { static: false })
  private tree: TreeComponent;
  @Output() onNodeSelection: any = new EventEmitter();

  private subscription: Subscription;

  constructor() {
    this.users = userData.users;
    this.options = {
      useVirtualScroll: true,
      nodeHeight: 30
    };
  }

  ngOnInit() {
    this.populateNodesStructure(this.users)
  }

  onInitialized(tree) {
    //Expand the contents of the first node on tree initialization
    this.treeModel = tree.treeModel;
    const firstRoot = tree.treeModel.roots[0];

    firstRoot.expand();
    firstRoot.setActiveAndVisible();
  }

  onNodeSelected(event) {
    this.onNodeSelection.emit({
      selectedNode: event.node.data,
    });
  }

  expandCreatedNode(nodeId) {
    const createdNodeInterval = interval();

    this.subscription = createdNodeInterval
      .subscribe(() => {
        const createdNode: TreeNode = this.treeModel.getNodeById(nodeId);

        createdNode.expandAll();
        createdNode.setActiveAndVisible();

        //Unsubscribe after task completion
        this.subscription.unsubscribe();
      })
  }

  populateNodesStructure(usersData) {
    this.nodes = [];

    usersData.forEach(userData => {
      let nodeItem: any = {};
      const { uuid, name, posts } = userData;

      nodeItem.id = uuid;
      nodeItem.name = name;
      nodeItem.children = [];
      nodeItem.nodeLevel = 0;
      nodeItem.userData = userData

      //Attach posts as children to to user node
      posts.forEach((post, postIndex) => {
        const { uuid, title, comments } = post;

        const userPost = {
          id: uuid,
          name: title,
          children: [],
          nodeLevel: 1,
          userData: userData,
          postUuid: uuid
        };

        nodeItem.children.push(userPost);

        //Check if a post has comments and attach them as children to the post node
        if (comments.length) {
          comments.forEach(comment => {
            const { uuid, body } = comment;

            const postComment = {
              id: uuid,
              name: body,
              nodeLevel: 2,
              userData: userData,
              postUuid: post.uuid
            };

            nodeItem.children[postIndex].children.push(postComment);
          });
        }
      });

      this.nodes.push(nodeItem);
    });
  }
}
