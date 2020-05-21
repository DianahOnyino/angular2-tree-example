import { Component, ViewChild } from '@angular/core';
import * as userData from '../app/data.json'
import { NgForm } from '@angular/forms';
import { Subject, Subscription, interval } from 'rxjs';
import { UsersComponent } from './users/users.component';
import { UserService } from './users/user.service';

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

  constructor(private userService: UserService) { }

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
    const post = this.userService.getPostByUuid(userPosts, postUuid);
    return post ? post.title : '';
  }

  displayForm(nodeLevel) {
    this.showForm = true;
    this.selectedNode.nodeLevel = nodeLevel;
  }

  toggleEditMode(form, selectedNode) {
    const setFormValuesInterval = interval();
    this.post = this.userService.getPostByUuid(selectedNode.userData.posts, selectedNode.postUuid);
    this.comment = this.userService.getCommentByUuid(this.post.comments, selectedNode.id)

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
    let users = this.users;

    if (!this.editMode) {
      this.userService.pushNewNodeToUsersArray(users, currentNode, newNode);
    } else {
      this.editMode = false;
    }

    this.refreshNodeItems(nodeId);
  }

  onSubmit(form: NgForm) {
    const value = form.value;
    const currentNode = this.selectedNode;
    const post = this.post;
    const comment = this.comment;

    const newNode = this.userService
      .populateNewNode(value, currentNode, post, comment, this.editMode);

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
    this.userService.delete(selectedNodeItem);

    this.usersChanged.next(this.users.slice());

    let nodeId = selectedNodeItem.userData.uuid;
    this.refreshNodeItems(nodeId);
  }

  refreshNodeItems(nodeId) {
    this.tree.populateNodesStructure(this.users);
    this.tree.treeModel.update();
    this.tree.expandCreatedNode(nodeId);
  }

  ngOnDestroy(): void {
    this.usersChangeSubscription.unsubscribe();
  }
}