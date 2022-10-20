# BoschUdacity_project3

## Ensuring Quality Releases using Azure CI/CD Pipeline

### Project objectives
- 

### Status badge


### Introduction

- This project demonstrates hands-on use of Azure DevOps CI/CD pipeline. It consists of the use of automated testing environments to ensure quality releases. Terraform is used to deploy the infrastructure in code (IaaC). Azure App Services was used to host the web application and Azure Pipelines for continuous integration, provision, build, deployment and testing of the whole framework. The automated tests run on a self-hosted Linux virtual machine (VM). UI Tests with Selenium, Integration Tests with PostMan, stress and endurance tests with  Apache JMeter were all passed using the agent created in the Linux VM. Furthermore, Azure Log Analytics workspace was employed to monitor and provide insight into the application's behaviour under load.

- Below is a flowchart showing the flow of processes in this task
<img width="833" alt="Screenshot 2022-10-16 at 18 15 44" src="https://user-images.githubusercontent.com/47278559/196046345-9445d331-4b98-4bed-9d21-ffb7298e79fc.png">

- Prerequisite
Have the following installed on the machine
1. Apache JMeter 
2. PostMan
3. Selenium
4. Azure account
5. Python

- Dependencies
For the following prerequisite to work as required, we want to make sure to install the following
1. Winzip
2. npm
3. Azure pipelines on the Linux Virtual machine
4. A self-hosted Linux agent
5. Terraform

### Getting Started
1. Fork and clone the starter repository into your local environment
2. Open the project on your favourite text editor or IDE (I used Pycharm)
3. Log into the [Azure Portal](https://portal.azure.com/) from Terminal
4. Log into [Azure DevOps](https://dev.azure.com/) and create a new Azure DevOps Organization

### Configuration and Installations
1. Terraform in Azure
- Create a Service Principal for Terraform
- Log into your Azure account by running `az login`.
- Next run `az account set --subscription="SUBSCRIPTION_ID"`to set the subscription_id to your account subscription.
- Create Service Principle with `az ad sp create-for-rbac --name ensuring-quality-releases-sp --role="Contributor" --scopes="/subscriptions/SUBSCRIPTION_ID"`. 

This command is expected to output the following credentials:
```
{
   "appId": "00000000-0000-0000-0000-000000000000",
   "displayName": "azure-cli-2017-06-05-10-41-15",
   "name": "http://azure-cli-2017-06-05-10-41-15",
   "password": "0000-0000-0000-0000-000000000000",
   "tenant": "00000000-0000-0000-0000-000000000000"
}
```

Create a `.azure_envs.sh` file inside the project directory and copy the content of the `.azure_envs.sh.template` to the newly created file. Change the parameters based on the output of the previous command. These values map to the `.azure_envs.sh` variables like so:
```
Application_Id is the `client_id`
Password is the `client_secret`
tenant is the `Tenant_id`
```

2. Configure the storage account and state backend
Follow the directives [here](https://docs.microsoft.com/en-us/azure/developer/terraform/store-state-in-azure-storage) to configure the storage account and state backend.`cd Terraform` and run `./config_storage_account.sh` and provide a resource group name with the desired location  for the resources to be hosted.

An example of this would be `./terraform/config_storage_account.sh -g "RESOURCE_GROUP_NAME" -l "LOCATION"`. This will output some parameters and the most interesting ones for our course are as listed below:
```
storage_account_name: tstate$RANDOM
container_name: tstate
access_key: 0000-0000-0000-0000-000000000000
```
Replace the `RESOURCE_GROUP_NAME` and `storage_account_name` in the [main.tf](https://github.com/adedayoas91/BoschUdacity_project3/blob/main/terraform/environment/test/main.tf) file in the environment directory and the `access_key` in the `.azure_envs.sh` script. Export `ACCESS_KEY="access_key"`
```
terraform {
    backend "azurerm" {
        resource_group_name  = "RESOURCE_GROUP_NAME"
        storage_account_name = "tstate$RANDOM"
        container_name       = "tstate"
        key                  = "terraform.tfstate"
    }
}
```
You will also need to replace the following parameters in the [azure-pipelines.yaml](https://github.com/adedayoas91/BoschUdacity_project3/blob/main/azure-pipelines.yaml) file.
```
backendAzureRmResourceGroupName: "RESOURCE_GROUP_NAME"
backendAzureRmStorageAccountName: 'tstate$RANDOM'
backendAzureRmContainerName: 'tstate'
backendAzureRmKey: 'terraform.tfstate'
````
Run `source .azure_envs.sh` to source into your local environment

3. Self-hosted Test Runner and REST API Infrastructure
> Create an SSH key for authentication to a Linux VM in Azure
To generate a public-private key pair run the following command (no need to provide a passphrase):
```
cd ~/.ssh/
ssh-keygen -t rsa -b 4096 -f az_eqr_id_rsa
```
Ensure that the keys were created by running `ls -ll | grep az_eqr_id_rsa`.

Follow the links for additional information on how to [create](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/create-ssh-keys-detailed) and [use](https://serversforhackers.com/c/creating-and-using-ssh-keys) SSH keys
> Create a Terraform variables `.tfvars` file to configure Terraform Variables
Create a terraform.tfvars file inside the [test](https://github.com/adedayoas91/BoschUdacity_project3/tree/main/terraform/environment/test) directory and copy the content of the `terraform.tfvars.template` to the newly created file. Change the parameters based on the outputs of the previous steps.

- The `subscription_id`, `client_id`, `client_secret`, and `tenant_id` can be found in the .azure_envs.sh file.
- Set your desired location and resource_group for the infrastructure.
- Ensure that the public key name `vm_public_key` is the same as the one created in step 2.1 of this guide.

> Deploy the REST API infrastructure from your local environment with Terraform with the following command `Terraform plan`. Next change directory to the test folder with `cd terraform/environments/test`. Inside this directory, initialise terraform with `terraform init` and after successful initialization, run  `terraform plan -out solution.plan` to output the solution plan. Finally, run `terraform apply "solution.plan"` to deploy the infrastructure.


If everything runs correctly you should be able to see the resources been created. You can also check the creation of the resources in the [Azure Portal](https://portal.azure.com/#blade/HubsExtension/BrowseResourceGroups) under
Home > Resource groups > "RESOURCE_GROUP_NAME"

3. Azure DevOps
Create a new Azure DevOps Project and Service Connections
- Login to [Azure DevOps](https://dev.azure.com/) and create a `New Project`
- Create a new Service Connection via Project settings > Service connections > New service connection. After successful creation, set service principal to automatic via Azure Resource Manager > Service principal (automatic)
- Select a Resource group, give the connection a name and description and `Save`.
IMPORTANT: You will need to create two service connections:

`service-connection-terraform` is created using the same resource group that you provided in step 1.2 of this guide.
`service-connection-webapp` is created using the resource group that you provided in terraform.tfvars file.
A detailed explanation of how to create a new Azure DevOps project and service connection can be found [here](https://www.youtube.com/watch?v=aIvl4NxCWwU&t=253s).

Ensure that the name of the service connections matches the names provided in the `.yaml` file. Also ensure that the webapp name matches the name provided in the `terraform.tfvars` file.

> Add the Self-hosted Test Runner to a Pipelines Environment
- Create a New Environment in Azure Pipelines. From inside your project in Azure DevOps via Pipelines > Environments > New environment
- Give the environment a name e.g. test, then select Virtual machines > Next. Choose `Linux` from the dropdown and REMEMBER to copy the Registration script
- From a local terminal connect to the Virtual Machine using the `ssh` key created earlier. The public_IP can be found in the Azure Portal under Home > Resource groups > "RESOURCE_GROUP_NAME" > "Virtual machine"
`ssh -o "IdentitiesOnly=yes" -i ~/.ssh/az_eqr_id_rsa marco@PublicIP`
- Once you are logged into the VM paste the Registration script and run it.

> Deploy a Log Analytics Workspace
- Deploy a new log analytics workspace by running the deploy_log_analytics_workspace.sh script. Make sure to set a resource group and provide a workspace name when promoted, e.g. ensuring-quality-releases-log. An example command to do this is as follows
```
cd analytics
./deploy_log_analytics_workspace.sh
```
- From a local terminal connect to the Virtual Machine as described above.
- Once logged into the VM run the following commands:
`wget https://raw.githubusercontent.com/Microsoft/OMS-Agent-for-Linux/master/installer/scripts/onboard_agent.sh sh onboard_agent.sh -w ${AZURE_LOG_ANALYTICS_ID} -s ${AZURE_LOG_ANALYTICS_PRIMARY_KEY}`
IMPORTANT: The AZURE_LOG_ANALYTICS_ID and AZURE_LOG_ANALYTICS_PRIMARY_KEY can be found in the [Azure Portal](https://portal.azure.com/#blade/HubsExtension/BrowseResourceGroups) under:
Home > Resource groups > "RESOURCE_GROUP_NAME" > "Log Analytics workspace" > Agents management
There you will also find the command to Download and onboard the agent for Linux.

- [Collect custom logs with Log Analytics agent in Azure Monitor](https://docs.microsoft.com/en-us/azure/azure-monitor/agents/data-sources-custom-logs)
For more information on how to create and install Log Analytic agents click the links below:

[Create a Log Analytics workspace with Azure CLI 2.0](https://docs.microsoft.com/en-us/azure/azure-monitor/logs/quick-create-workspace-cli)
[Install Log Analytics agent on Linux computers](https://docs.microsoft.com/en-us/azure/azure-monitor/agents/agent-linux)
> Upload the public SSH key and tfvars to Pipelines Library
- Add a secure file to Azure Pipelines. From inside your project in Azure DevOps go to:
Pipelines > Library > Secure files > + Secure file
- Add the public ssh key and the `terraform.tfvars` files to the secure files library.
- Give the pipeline permissions to use the file:
`"SECURE_FILE_NAME" > Authorize for use in all pipelines`

> Creating a new Azure Pipeline
- Move into your project in Azure DevOps and create a new pipeline via Pipelines > Pipelines > Create new pipeline
- Select your project from GitHub choose `Existing Azure Pipelines YAML file`
- Select the main branch and select the path to the [azure-pipelines.yaml](https://github.com/adedayoas91/BoschUdacity_project3/blob/main/azure-pipelines.yaml) file.
- Click Continue and Run pipeline


> The result of the following is shown in the following screenshots.

<img width="1440" alt="Screenshot 2022-10-15 at 22 16 49" src="https://user-images.githubusercontent.com/47278559/196385831-774883ef-3678-43df-8890-e069856c5dc7.png">

Successful completion of this create the webapp which I have named `myProject3-Appservice`. A screenshot of successful creation of the webapp both in the Azure portal as well as loading the webapp URL are shown below in that order:
<img width="1440" alt="Screenshot 2022-10-15 at 22 20 39" src="https://user-images.githubusercontent.com/47278559/196391517-870f9f90-9093-493c-adad-953793714a3e.png">

<img width="1440" alt="Screenshot 2022-10-15 at 22 20 34" src="https://user-images.githubusercontent.com/47278559/196391017-97749106-4830-4428-8434-d0d23202e6c0.png">

<img width="1440" alt="Screenshot 2022-10-15 at 22 49 34" src="https://user-images.githubusercontent.com/47278559/196395235-57624a40-f359-40c3-b6c5-f1e1109ae425.png">

<img width="1440" alt="Screenshot 2022-10-16 at 01 38 17" src="https://user-images.githubusercontent.com/47278559/196914189-eeffb64f-47f0-4ed2-8207-fbd534a53f56.png">


> Copy the `Request URL` shown in the screenshot below to be used for the JMeter stress and endurance tests 

<img width="1440" alt="Screenshot 2022-10-15 at 22 49 59" src="https://user-images.githubusercontent.com/47278559/196395278-5bcaf3b1-b17f-4ee4-88c9-4e1cbe59972e.png">

> Several tests were carried out and below are screenshots of the results from Azure pipelines

<img width="1440" alt="Screenshot 2022-10-15 at 23 54 13" src="https://user-images.githubusercontent.com/47278559/196909508-5fda05d0-77b9-4d07-b9c8-380e5a51ada9.png">

<img width="1440" alt="Screenshot 2022-10-16 at 01 40 45" src="https://user-images.githubusercontent.com/47278559/196914097-40a7a36d-be7f-4afc-8bea-0de7ae93aca3.png">

<img width="1440" alt="Screenshot 2022-10-16 at 01 40 50" src="https://user-images.githubusercontent.com/47278559/196914324-352fb6c4-da4c-479e-8a31-d9133a4d4795.png">

<img width="1440" alt="Screenshot 2022-10-16 at 01 41 07" src="https://user-images.githubusercontent.com/47278559/196914392-f3bc5c5e-0372-41f9-804b-010bd63078b2.png">

<img width="1440" alt="Screenshot 2022-10-16 at 01 42 01" src="https://user-images.githubusercontent.com/47278559/196914450-46030959-2750-475c-8446-1e8c4881a85a.png">

<img width="1440" alt="Screenshot 2022-10-16 at 01 42 09" src="https://user-images.githubusercontent.com/47278559/196914503-3801649d-04d1-4551-834a-8dad419b4144.png">

<img width="1440" alt="Screenshot 2022-10-16 at 01 42 16" src="https://user-images.githubusercontent.com/47278559/196914567-1de325dd-bfa0-4bff-bc5c-a2a8c388d868.png">



> Also there are screenshots from the Newmann test results

<img width="1440" alt="Screenshot 2022-10-15 at 23 56 10" src="https://user-images.githubusercontent.com/47278559/196909588-e5f91996-99eb-4ed9-aba0-a82815bbce20.png">

<img width="1440" alt="Screenshot 2022-10-15 at 23 57 52" src="https://user-images.githubusercontent.com/47278559/196909646-bdab99b5-63d0-4f9c-8d3e-d1c3c454cb0d.png">

Alerts was created for the webapp and can be seen as followed in the below screenshots

<img width="1440" alt="Screenshot 2022-10-16 at 00 36 16" src="https://user-images.githubusercontent.com/47278559/196910230-0e387e8d-5f1f-45f7-aa49-0fd890648a44.png">

<img width="1440" alt="Screenshot 2022-10-16 at 00 47 28" src="https://user-images.githubusercontent.com/47278559/196910341-b6a176aa-8fde-4494-a519-5a324a682792.png">

<img width="1440" alt="Screenshot 2022-10-16 at 01 13 07" src="https://user-images.githubusercontent.com/47278559/196910404-5d010217-5120-4281-9dea-b55e4a3e52e5.png">

<img width="1440" alt="Screenshot 2022-10-16 at 01 36 16" src="https://user-images.githubusercontent.com/47278559/196912164-2ced1eb6-a5cb-4a6f-ad75-4ca28050ee39.png">


An email alert received when the appservice encountered a http404 error is as shown below as well
<img width="1440" alt="Screenshot 2022-10-16 at 01 13 26" src="https://user-images.githubusercontent.com/47278559/196910841-ecc0c6d8-4a41-42d3-bc64-d04ef654f132.png">

<img width="1440" alt="Screenshot 2022-10-16 at 01 36 16" src="https://user-images.githubusercontent.com/47278559/196913141-cbf06d55-780b-4732-aae0-9df0a1581b64.png">

> The final stage of the pipeline was also completed and all tests were passed as shown below

<img width="1440" alt="Screenshot 2022-10-16 at 01 25 34" src="https://user-images.githubusercontent.com/47278559/196911940-829d3b9c-474c-404e-bed9-fd4c9a9e8122.png">

> In the end, I ensured to delete all resources to save cost

<img width="1440" alt="Screenshot 2022-10-16 at 01 45 12" src="https://user-images.githubusercontent.com/47278559/196914724-8c1160bc-77dd-4fe1-85c5-9688c254dfe4.png">

> This is what the final repo looks like after updating the repo in GitHub

<img width="1440" alt="Screenshot 2022-10-16 at 13 14 52" src="https://user-images.githubusercontent.com/47278559/196915140-4a99425c-058d-41a1-877e-2b11d6f78c93.png">


### Resources
Helpful resources from Microsoft are listed below

- [Design a CI/CD pipeline using Azure DevOps](https://docs.microsoft.com/en-us/azure/architecture/example-scenario/apps/devops-dotnet-webapp)
- [Create a CI/CD pipeline for GitHub repo using Azure DevOps Starter](https://docs.microsoft.com/en-us/azure/devops-project/azure-devops-project-github)
- [Create a CI/CD pipeline for Python with Azure DevOps Starter](https://docs.microsoft.com/en-us/azure/devops-project/azure-devops-project-python?WT.mc_id=udacity_learn-wwl)
- [Continuous deployment to Azure App Service](https://docs.microsoft.com/en-us/azure/app-service/deploy-continuous-deployment?tabs=github#option-1-use-app-service-kudu-build-server?WT.mc_id=udacity_learn-wwl)
- [Flask on Azure App Services](https://docs.microsoft.com/en-us/azure/app-service/quickstart-python?tabs=bash&WT.mc_id=udacity_learn-wwl&pivots=python-framework-flask)
- [Azure Pipelines for Python](https://docs.microsoft.com/en-us/azure/devops/pipelines/ecosystems/python?view=azure-devops&WT.mc_id=udacity_learn-wwl)
